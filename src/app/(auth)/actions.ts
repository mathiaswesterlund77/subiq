"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 attempts per window

async function checkRateLimit(action: string): Promise<boolean> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = `${action}:${ip}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true; // rate limited
  }
  return false;
}

async function getOrigin() {
  // Always prefer NEXT_PUBLIC_APP_URL for email links (points to deployed site)
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = h.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

export async function login(formData: FormData) {
  if (await checkRateLimit("login")) {
    return { error: "Too many attempts. Please try again later." };
  }

  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return {
        error: "Please verify your email before signing in.",
        code: "EMAIL_NOT_CONFIRMED" as const,
        email,
      };
    }
    return { error: error.message };
  }

  redirect("/dashboard?login=success");
}

export async function signup(formData: FormData) {
  if (await checkRateLimit("signup")) {
    return { error: "Too many attempts. Please try again later." };
  }

  const admin = createAdminClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const companyName = formData.get("company_name") as string;

  const { data: userData, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: {
      full_name: fullName,
      company_name: companyName,
    },
  });

  if (error) {
    if (error.message.includes("already been registered")) {
      return { error: "An account with this email already exists." };
    }
    return { error: error.message };
  }

  const userId = userData.user.id;

  await new Promise((resolve) => setTimeout(resolve, 500));

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id, workspace_id")
    .eq("id", userId)
    .single();

  if (!existingProfile) {
    const { data: workspace, error: wsError } = await admin
      .from("workspaces")
      .insert({ name: companyName || "My Workspace" })
      .select("id")
      .single();

    if (wsError) {
      await admin.auth.admin.deleteUser(userId);
      return { error: `Signup failed: ${wsError.message}` };
    }

    const { error: profileError } = await admin.from("profiles").upsert(
      {
        id: userId,
        workspace_id: workspace.id,
        role: "admin",
        email,
        full_name: fullName || "",
      },
      { onConflict: "id", ignoreDuplicates: true }
    );

    if (profileError) {
      await admin.auth.admin.deleteUser(userId);
      return { error: `Signup failed: ${profileError.message}` };
    }
  }

  try {
    const origin = await getOrigin();
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    if (!linkError && linkData?.properties?.hashed_token) {
      const verifyUrl = `${origin}/auth/verify?token_hash=${linkData.properties.hashed_token}&type=magiclink`;
      await sendVerificationEmail(email, verifyUrl);
    }
  } catch {
    // Non-blocking — account exists, user can request a new link from /login
  }

  return { success: true };
}

export async function forgotPassword(formData: FormData) {
  if (await checkRateLimit("forgotPassword")) {
    return { success: true };
  }

  const email = formData.get("email") as string;

  if (!email || !email.includes("@")) {
    return { success: true };
  }

  try {
    const admin = createAdminClient();
    const origin = await getOrigin();

    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
    });

    if (!error && data?.properties?.hashed_token) {
      const url = new URL("/auth/callback", origin);
      url.searchParams.set("token_hash", data.properties.hashed_token);
      url.searchParams.set("type", "recovery");
      url.searchParams.set("next", "/reset-password");
      await sendPasswordResetEmail(email, url.toString());
    }
  } catch {}

  return { success: true };
}

export async function resetPassword(formData: FormData) {
  if (await checkRateLimit("resetPassword")) {
    return { error: "Too many attempts. Please try again later." };
  }

  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function resendVerificationEmail(formData: FormData) {
  if (await checkRateLimit("resendVerification")) {
    return { success: true };
  }

  const email = formData.get("email") as string;
  if (!email || !email.includes("@")) {
    return { success: true };
  }

  try {
    const admin = createAdminClient();
    const origin = await getOrigin();

    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    if (!error && data?.properties?.hashed_token) {
      const verifyUrl = `${origin}/auth/verify?token_hash=${data.properties.hashed_token}&type=magiclink`;
      await sendVerificationEmail(email, verifyUrl);
    }
  } catch {
    // Always return success to avoid user enumeration
  }

  return { success: true };
}
