import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { stripe, planForPriceId } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BillingStatus } from "@/lib/supabase/types";

/**
 * Server-only helpers that keep `workspace_billing` / `billing_invoices` in
 * sync with Stripe. Used by both the webhook and the billing page — the page
 * pulls fresh state on load so plans and invoices stay correct even when the
 * webhook is not configured (e.g. local dev without `stripe listen`).
 */

/** Map a Stripe subscription status onto our `workspace_billing.status`. */
export function mapStripeStatus(status: string): BillingStatus {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    default:
      return "canceled";
  }
}

/** Resolve a Stripe customer reference to its id. */
export function stripeCustomerId(
  customer: string | { id: string } | null | undefined
): string | null {
  if (!customer) return null;
  return typeof customer === "string" ? customer : customer.id;
}

/** Period end now lives on the subscription item (Stripe API 2026-04-22). */
function subscriptionPeriodEnd(subscription: Stripe.Subscription): string | null {
  const ts = subscription.items.data[0]?.current_period_end;
  return ts ? new Date(ts * 1000).toISOString() : null;
}

/** Sync a Stripe subscription's state onto the workspace's billing row. */
export async function applySubscriptionToBilling(
  admin: SupabaseClient,
  workspaceId: string,
  subscription: Stripe.Subscription
): Promise<void> {
  const itemPriceId = subscription.items.data[0]?.price.id;
  const mapped = itemPriceId ? planForPriceId(itemPriceId) : null;

  const { error } = await admin.from("workspace_billing").upsert(
    {
      workspace_id: workspaceId,
      stripe_customer_id: stripeCustomerId(subscription.customer),
      stripe_subscription_id: subscription.id,
      plan: mapped?.plan ?? "free",
      billing_cycle: mapped?.interval ?? null,
      status: mapStripeStatus(subscription.status),
      current_period_end: subscriptionPeriodEnd(subscription),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "workspace_id" }
  );
  // Surface write failures instead of swallowing them — a silent upsert
  // error here is exactly what kept plan upgrades from taking effect.
  if (error) {
    throw new Error(
      `Failed to sync billing for workspace ${workspaceId}: ${error.message}`
    );
  }
}

/** Drop a workspace back to the free plan (no live subscription). */
export async function resetBillingToFree(
  admin: SupabaseClient,
  workspaceId: string
): Promise<void> {
  const { error } = await admin
    .from("workspace_billing")
    .update({
      plan: "free",
      status: "active",
      stripe_subscription_id: null,
      billing_cycle: null,
      current_period_end: null,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq("workspace_id", workspaceId);
  if (error) {
    throw new Error(
      `Failed to reset billing for workspace ${workspaceId}: ${error.message}`
    );
  }
}

/**
 * Pull the latest subscription + invoice state for a workspace straight from
 * Stripe and persist it. Lets the billing page stay correct without relying on
 * webhook delivery.
 */
export async function refreshBillingFromStripe(
  workspaceId: string,
  customerId: string
): Promise<void> {
  const admin = createAdminClient();

  // Current subscription state.
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 10,
  });
  const liveSub = subscriptions.data.find((s) =>
    ["active", "trialing", "past_due", "unpaid"].includes(s.status)
  );
  if (liveSub) {
    await applySubscriptionToBilling(admin, workspaceId, liveSub);
  } else {
    await resetBillingToFree(admin, workspaceId);
  }

  // Invoice history — record every paid invoice.
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit: 100,
  });
  const rows = invoices.data
    .filter((inv) => inv.status === "paid" && Boolean(inv.id))
    .map((inv) => ({
      workspace_id: workspaceId,
      stripe_invoice_id: inv.id as string,
      amount_paid: inv.amount_paid,
      currency: inv.currency,
      // Rows are pre-filtered to paid invoices above.
      status: "paid",
      invoice_pdf: inv.invoice_pdf ?? null,
      paid_at: inv.status_transitions?.paid_at
        ? new Date(inv.status_transitions.paid_at * 1000).toISOString()
        : null,
    }));
  if (rows.length > 0) {
    const { error } = await admin
      .from("billing_invoices")
      .upsert(rows, { onConflict: "stripe_invoice_id" });
    if (error) {
      throw new Error(
        `Failed to sync invoices for workspace ${workspaceId}: ${error.message}`
      );
    }
  }
}
