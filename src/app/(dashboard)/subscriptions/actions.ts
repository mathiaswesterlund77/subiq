"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getWorkspacePlan } from "@/lib/billing";
import { PLAN_LIMITS, PLAN_LABELS } from "@/lib/plans";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function addSubscription(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, workspace_id")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { success: false, error: "Only admins can add subscriptions" };
  }

  // Enforce the plan's tracked-tool limit.
  const plan = await getWorkspacePlan(supabase, profile.workspace_id);
  const toolLimit = PLAN_LIMITS[plan].maxTools;
  if (toolLimit !== Infinity) {
    const { count } = await supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", profile.workspace_id);
    if ((count ?? 0) >= toolLimit) {
      return {
        success: false,
        error: `Your ${PLAN_LABELS[plan]} plan is limited to ${toolLimit} tracked tools. Upgrade to add more.`,
      };
    }
  }

  const software_name = formData.get("software_name") as string;
  const price = Number(formData.get("price"));
  const currency = (formData.get("currency") as string).toUpperCase();
  const billing_cycle = formData.get("billing_cycle") as string;
  const seats = Number(formData.get("seats"));
  const rawDate = formData.get("next_renewal_date") as string;
  const next_renewal_date = rawDate || new Date().toISOString().split("T")[0];
  const status = formData.get("status") as string;

  if (!software_name || !currency || !billing_cycle || !status) {
    return { success: false, error: "All fields are required" };
  }
  if (price <= 0) return { success: false, error: "Price must be greater than 0" };
  if (seats < 1) return { success: false, error: "Seats must be at least 1" };
  if (isNaN(new Date(next_renewal_date).getTime())) {
    return { success: false, error: "Invalid date" };
  }

  const { error } = await supabase.from("subscriptions").insert({
    workspace_id: profile.workspace_id,
    software_name,
    price,
    currency,
    billing_cycle,
    seats,
    next_renewal_date,
    status,
    created_by: user.id,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/subscriptions");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateSubscription(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, workspace_id")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { success: false, error: "Only admins can edit subscriptions" };
  }

  const id = formData.get("id") as string;
  const software_name = formData.get("software_name") as string;
  const price = Number(formData.get("price"));
  const currency = (formData.get("currency") as string).toUpperCase();
  const billing_cycle = formData.get("billing_cycle") as string;
  const seats = Number(formData.get("seats"));
  const rawDate = formData.get("next_renewal_date") as string;
  const next_renewal_date = rawDate || new Date().toISOString().split("T")[0];
  const status = formData.get("status") as string;

  if (!id || !software_name || !currency || !billing_cycle || !status) {
    return { success: false, error: "All fields are required" };
  }
  if (price <= 0) return { success: false, error: "Price must be greater than 0" };
  if (seats < 1) return { success: false, error: "Seats must be at least 1" };

  const { error } = await supabase
    .from("subscriptions")
    .update({
      software_name,
      price,
      currency,
      billing_cycle,
      seats,
      next_renewal_date,
      status,
    })
    .eq("id", id)
    .eq("workspace_id", profile.workspace_id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/subscriptions");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleSubscriptionUnused(
  id: string,
  isUnused: boolean
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, workspace_id")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { success: false, error: "Only admins can change unused status" };
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({ is_unused: isUnused })
    .eq("id", id)
    .eq("workspace_id", profile.workspace_id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/subscriptions");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteSubscription(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, workspace_id")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { success: false, error: "Only admins can delete subscriptions" };
  }

  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("id", id)
    .eq("workspace_id", profile.workspace_id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/subscriptions");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function importSubscriptions(rows: Record<string, string>[]): Promise<{
  success: boolean;
  imported: number;
  skipped: { row: number; reason: string }[];
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, imported: 0, skipped: [], error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, workspace_id")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { success: false, imported: 0, skipped: [], error: "Only admins can import" };
  }

  // CSV import is a paid feature; paid plans have no tracked-tool cap.
  const plan = await getWorkspacePlan(supabase, profile.workspace_id);
  if (!PLAN_LIMITS[plan].csv) {
    return {
      success: false,
      imported: 0,
      skipped: [],
      error: "CSV import is available on the Pro and Business plans. Upgrade to use it.",
    };
  }

  const validRows: Record<string, unknown>[] = [];
  const skipped: { row: number; reason: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = row.software_name?.trim();
    const price = Number(row.price);
    const currency = row.currency?.trim().toUpperCase();
    const billing_cycle = row.billing_cycle?.trim().toLowerCase();
    const seats = Number(row.seats);
    const next_renewal_date = row.next_renewal_date?.trim();
    const status = row.status?.trim().toLowerCase();

    if (!name) { skipped.push({ row: i + 1, reason: "Missing software_name" }); continue; }
    if (isNaN(price) || price <= 0) { skipped.push({ row: i + 1, reason: "Invalid price" }); continue; }
    if (!currency) { skipped.push({ row: i + 1, reason: "Missing currency" }); continue; }
    if (billing_cycle !== "monthly" && billing_cycle !== "yearly") { skipped.push({ row: i + 1, reason: "Invalid billing_cycle" }); continue; }
    if (isNaN(seats) || seats < 1) { skipped.push({ row: i + 1, reason: "Invalid seats" }); continue; }
    if (!next_renewal_date || isNaN(new Date(next_renewal_date).getTime())) { skipped.push({ row: i + 1, reason: "Invalid date" }); continue; }
    if (status !== "active" && status !== "cancelled") { skipped.push({ row: i + 1, reason: "Invalid status" }); continue; }

    validRows.push({
      workspace_id: profile.workspace_id,
      software_name: name,
      price,
      currency,
      billing_cycle,
      seats,
      next_renewal_date,
      status,
      created_by: user.id,
    });
  }

  if (validRows.length === 0) {
    return { success: true, imported: 0, skipped };
  }

  const { error } = await supabase.from("subscriptions").insert(validRows);

  if (error) return { success: false, imported: 0, skipped, error: error.message };

  revalidatePath("/subscriptions");
  revalidatePath("/dashboard");
  return { success: true, imported: validRows.length, skipped };
}
