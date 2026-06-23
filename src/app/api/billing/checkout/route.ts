import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe, priceId } from "@/lib/stripe";

export const runtime = "nodejs";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Creates a Stripe Checkout Session for upgrading to a paid plan.
 * Body: `{ plan: "pro" | "business", interval: "monthly" | "yearly" }`.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, workspace_id, email")
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

    let plan: unknown;
    let interval: unknown;
    try {
      const body = await request.json();
      plan = body.plan;
      interval = body.interval;
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    if (plan !== "pro" && plan !== "business") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    if (interval !== "monthly" && interval !== "yearly") {
      return NextResponse.json(
        { error: "Invalid billing interval" },
        { status: 400 }
      );
    }

    // workspace_billing is webhook-owned (RLS allows reads only), so use the
    // service-role client for the customer-id lookup and write.
    const admin = createAdminClient();
    const { data: billing } = await admin
      .from("workspace_billing")
      .select("stripe_customer_id")
      .eq("workspace_id", profile.workspace_id)
      .maybeSingle();

    let customerId: string | null = billing?.stripe_customer_id ?? null;

    if (customerId) {
      try {
        const existing = await stripe.subscriptions.list({
          customer: customerId,
          status: "all",
          limit: 10,
        });
        const hasLiveSub = existing.data.some((s) =>
          ["active", "trialing", "past_due", "unpaid"].includes(s.status)
        );
        if (hasLiveSub) {
          return NextResponse.json(
            { error: "This workspace already has an active subscription." },
            { status: 409 }
          );
        }
      } catch (err) {
        const code =
          typeof err === "object" && err !== null && "code" in err
            ? (err as { code?: unknown }).code
            : undefined;
        if (code === "resource_missing") {
          customerId = null;
        } else {
          throw err;
        }
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email ?? user.email ?? undefined,
        metadata: { workspace_id: profile.workspace_id },
      });
      customerId = customer.id;
      // Persist immediately so retries reuse the same customer.
      await admin
        .from("workspace_billing")
        .upsert(
          { workspace_id: profile.workspace_id, stripe_customer_id: customerId },
          { onConflict: "workspace_id" }
        );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId(plan, interval), quantity: 1 }],
      success_url: `${appUrl}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/billing?checkout=cancelled`,
      allow_promotion_codes: true,
      metadata: { workspace_id: profile.workspace_id },
      subscription_data: {
        metadata: { workspace_id: profile.workspace_id },
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 502 }
      );
    }
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[BILLING CHECKOUT] Failed to create session:", err);
    // Surface the real cause in development to make debugging possible.
    return NextResponse.json(
      { error: isDev ? message : "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }
}
