import { requireAuth } from "@/lib/auth-guard";
import { stripe, planForPriceId } from "@/lib/stripe";
import { getWorkspaceBilling } from "@/lib/billing";
import { refreshBillingFromStripe } from "@/lib/billing-sync";
import { PLAN_LABELS, PLAN_LIMITS, normalizePlan } from "@/lib/plans";
import type { BillingInvoice } from "@/lib/supabase/types";
import { PlanSelector } from "./components/plan-selector";
// import { ManageBillingButton } from "./components/manage-billing-button";
import { CheckoutToast } from "./components/checkout-toast";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-400/10 text-emerald-400",
  past_due: "bg-red-500/10 text-red-400",
  canceled: "bg-white/10 text-gray-400",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; session_id?: string }>;
}) {
  const { supabase, profile } = await requireAuth();
  const { checkout, session_id } = await searchParams;
  const isAdmin = profile.role === "admin";

  let purchaseConversion:
    | { value: number; currency: string; transactionId: string; planName: string }
    | undefined;
  if (checkout === "success" && session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ["line_items"],
      });
      if (
        (session.payment_status === "paid" ||
          session.payment_status === "no_payment_required") &&
        typeof session.amount_total === "number" &&
        session.currency &&
        session.metadata?.workspace_id === profile.workspace_id
      ) {
        const purchasedPriceId = session.line_items?.data[0]?.price?.id;
        const purchasedPlan = purchasedPriceId
          ? planForPriceId(purchasedPriceId)?.plan
          : undefined;
        purchaseConversion = {
          value: session.amount_total / 100,
          currency: session.currency.toUpperCase(),
          transactionId: session.id,
          planName: purchasedPlan ? PLAN_LABELS[purchasedPlan] : "Subscription",
        };
      }
    } catch (err) {
      console.error(
        "[BILLING] Could not load checkout session for conversion:",
        err
      );
    }
  }

  // Pull the latest plan + invoices from Stripe so the page is correct even
  // when the webhook is not running (e.g. local dev without `stripe listen`).
  let billing = await getWorkspaceBilling(supabase, profile.workspace_id);
  if (billing?.stripe_customer_id) {
    try {
      await refreshBillingFromStripe(
        profile.workspace_id,
        billing.stripe_customer_id
      );
      billing = await getWorkspaceBilling(supabase, profile.workspace_id);
    } catch (err) {
      console.error("[BILLING] Stripe refresh failed:", err);
    }
  }

  const plan = normalizePlan(billing?.plan);
  const status = billing?.status ?? "active";
  const limits = PLAN_LIMITS[plan];

  const [{ data: invoices }, { count: toolCount }] = await Promise.all([
    supabase
      .from("billing_invoices")
      .select("*")
      .eq("workspace_id", profile.workspace_id)
      .order("paid_at", { ascending: false, nullsFirst: false })
      .returns<BillingInvoice[]>(),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", profile.workspace_id),
  ]);

  const toolsUsed = toolCount ?? 0;
  const toolsLimitLabel =
    limits.maxTools === Infinity ? "unlimited" : String(limits.maxTools);
  const membersLimitLabel =
    limits.maxMembers === Infinity
      ? "Unlimited"
      : `Up to ${limits.maxMembers}`;

  // const hasStripeCustomer = Boolean(billing?.stripe_customer_id);
  const billingDateLabel = billing?.cancel_at_period_end
    ? "Cancels on"
    : "Next billing date";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <CheckoutToast status={checkout} purchase={purchaseConversion} />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Billing</h1>
        <p className="text-gray-500">
          Manage your plan, payment method and invoices.
        </p>
      </div>

      {/* Current plan */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white">
              {PLAN_LABELS[plan]} plan
            </h2>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize ${
                STATUS_STYLES[status] ?? STATUS_STYLES.canceled
              }`}
            >
              {status.replace("_", " ")}
            </span>
          </div>
          {/* Manage billing button hidden. To re-enable, uncomment the
              ManageBillingButton import, the hasStripeCustomer const, and
              the line below. */}
          {/* {isAdmin && hasStripeCustomer && <ManageBillingButton />} */}
        </div>

        <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">
              Tracked tools
            </dt>
            <dd className="mt-0.5 text-sm text-white">
              {toolsUsed} of {toolsLimitLabel}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">
              Team members
            </dt>
            <dd className="mt-0.5 text-sm text-white">{membersLimitLabel}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">
              {billingDateLabel}
            </dt>
            <dd className="mt-0.5 text-sm text-white">
              {billing?.current_period_end
                ? formatDate(billing.current_period_end)
                : "—"}
            </dd>
          </div>
        </dl>

        {status === "past_due" && (
          <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            Your last payment failed. Update your payment method to keep your
            plan active.
          </div>
        )}
        {plan !== "free" && billing?.cancel_at_period_end && (
          <div className="mt-4 rounded-lg border border-yellow-400/20 bg-yellow-400/[0.06] px-4 py-3 text-sm text-yellow-200/90">
            Your subscription is set to cancel at the end of the billing period.
          </div>
        )}
      </div>

      {/* Plans */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
        <h2 className="text-base font-semibold text-white">
          {plan === "free" ? "Plans" : "Your plan"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {plan === "free"
            ? "Upgrade to unlock unlimited tracked tools, more team members and CSV import/export."
            : "The plan currently active on this workspace."}
        </p>
        <PlanSelector
          currentPlan={plan}
          canManage={isAdmin}
          billingCycle={billing?.billing_cycle ?? null}
        />
      </div>

      {/* Invoice history */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
        <h2 className="text-base font-semibold text-white">Invoice history</h2>
        <p className="mt-1 text-sm text-gray-500">
          Payments on this workspace.
        </p>
        {invoices && invoices.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-3 py-3 text-sm text-gray-300">
                      {formatDate(invoice.paid_at ?? invoice.created_at)}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-300">
                      {formatAmount(invoice.amount_paid, invoice.currency)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {invoice.invoice_pdf ? (
                        <a
                          href={invoice.invoice_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-yellow-400 hover:text-yellow-300"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="text-sm text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">No invoices yet.</p>
        )}
      </div>
    </div>
  );
}
