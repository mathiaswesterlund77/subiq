/**
 * Plan definitions — the single source of truth for limits, labels and
 * display pricing.
 *
 * Safe to import from both client and server code: no secrets, no `process.env`.
 * Stripe price-ID resolution lives in `src/lib/stripe.ts` (server-only).
 */

export type Plan = "free" | "pro" | "business";
export type Interval = "monthly" | "yearly";

export interface PlanLimits {
  /** Max tracked tools (subscriptions). `Infinity` means unlimited. */
  maxTools: number;
  /** Max workspace members, including pending invites. `Infinity` means unlimited. */
  maxMembers: number;
  /** Whether CSV import/export is available. */
  csv: boolean;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: { maxTools: 5, maxMembers: 1, csv: false },
  pro: { maxTools: Infinity, maxMembers: 10, csv: true },
  business: { maxTools: Infinity, maxMembers: Infinity, csv: true },
};

export const PLAN_LABELS: Record<Plan, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
};

/**
 * Display price per month, in USD. `yearly` is the effective monthly rate when
 * billed annually. These are marketing figures — they must be kept in sync with
 * the actual prices configured in the Stripe dashboard.
 */
export const PLAN_PRICING: Record<Plan, Record<Interval, number>> = {
  free: { monthly: 0, yearly: 0 },
  pro: { monthly: 19, yearly: 16 },
  business: { monthly: 49, yearly: 39 },
};

/** Coerce an arbitrary value (e.g. a raw database column) into a known plan. */
export function normalizePlan(value: unknown): Plan {
  return value === "pro" || value === "business" ? value : "free";
}
