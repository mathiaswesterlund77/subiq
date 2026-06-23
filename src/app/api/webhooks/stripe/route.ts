import { NextResponse } from "next/server";
import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  applySubscriptionToBilling,
  resetBillingToFree,
  stripeCustomerId,
} from "@/lib/billing-sync";

export const runtime = "nodejs";

/** Resolve which workspace a Stripe customer belongs to. */
async function workspaceForCustomer(
  admin: SupabaseClient,
  customer: string | null,
  fallback?: string | null
): Promise<string | null> {
  if (customer) {
    const { data } = await admin
      .from("workspace_billing")
      .select("workspace_id")
      .eq("stripe_customer_id", customer)
      .maybeSingle();
    if (data?.workspace_id) return data.workspace_id as string;
  }
  return fallback ?? null;
}

/**
 * Stripe webhook receiver. Verifies the signature, then syncs subscription and
 * invoice state into `workspace_billing` / `billing_invoices`. All writes are
 * idempotent (upserts keyed on natural Stripe IDs), so event re-delivery is safe.
 */
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error("[STRIPE WEBHOOK] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const workspaceId = session.metadata?.workspace_id;
        if (workspaceId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id
          );
          await applySubscriptionToBilling(admin, workspaceId, subscription);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const workspaceId = await workspaceForCustomer(
          admin,
          stripeCustomerId(subscription.customer),
          subscription.metadata?.workspace_id
        );
        if (workspaceId) {
          await applySubscriptionToBilling(admin, workspaceId, subscription);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const workspaceId = await workspaceForCustomer(
          admin,
          stripeCustomerId(subscription.customer),
          subscription.metadata?.workspace_id
        );
        if (workspaceId) {
          await resetBillingToFree(admin, workspaceId);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const workspaceId = await workspaceForCustomer(
          admin,
          stripeCustomerId(invoice.customer)
        );
        if (workspaceId && invoice.id) {
          const { error: invoiceError } = await admin
            .from("billing_invoices")
            .upsert(
              {
                workspace_id: workspaceId,
                stripe_invoice_id: invoice.id,
                amount_paid: invoice.amount_paid,
                currency: invoice.currency,
                status: "paid",
                invoice_pdf: invoice.invoice_pdf ?? null,
                paid_at: invoice.status_transitions?.paid_at
                  ? new Date(
                      invoice.status_transitions.paid_at * 1000
                    ).toISOString()
                  : new Date().toISOString(),
              },
              { onConflict: "stripe_invoice_id" }
            );
          if (invoiceError) {
            throw new Error(
              `Failed to record invoice ${invoice.id}: ${invoiceError.message}`
            );
          }
          // A successful payment clears any past-due flag.
          await admin
            .from("workspace_billing")
            .update({ status: "active", updated_at: new Date().toISOString() })
            .eq("workspace_id", workspaceId);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const workspaceId = await workspaceForCustomer(
          admin,
          stripeCustomerId(invoice.customer)
        );
        if (workspaceId) {
          await admin
            .from("workspace_billing")
            .update({ status: "past_due", updated_at: new Date().toISOString() })
            .eq("workspace_id", workspaceId);
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`[STRIPE WEBHOOK] Error handling ${event.type}:`, err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
