import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Creates a Stripe Billing Portal session so admins can manage their
 * payment method, switch plans, view invoices, or cancel.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, workspace_id")
    .eq("id", user.id)
    .single();
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 401 });
  }
  if (profile.role !== "admin") {
    return NextResponse.json(
      { error: "Only admins can manage billing" },
      { status: 403 }
    );
  }

  const admin = createAdminClient();
  const { data: billing } = await admin
    .from("workspace_billing")
    .select("stripe_customer_id")
    .eq("workspace_id", profile.workspace_id)
    .maybeSingle();

  if (!billing?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No billing account yet — upgrade to a paid plan first." },
      { status: 400 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: billing.stripe_customer_id,
      return_url: `${appUrl}/billing`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[BILLING PORTAL] Failed to create session:", err);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV !== "production"
            ? message
            : "Could not open the billing portal. Please try again.",
      },
      { status: 500 }
    );
  }
}
