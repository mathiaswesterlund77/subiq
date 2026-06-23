import Stripe from "stripe";
import type { Interval, Plan } from "./plans";

/**
 * Server-side Stripe client. Only import this from route handlers / server code
 * — it relies on the secret key and must never reach the browser bundle.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

type PaidPlan = Exclude<Plan, "free">;

const PRICE_IDS: Record<PaidPlan, Record<Interval, string | undefined>> = {
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
  },
  business: {
    monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY,
    yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY,
  },
};

/** Resolve the Stripe price ID for a paid plan + billing interval. */
export function priceId(plan: PaidPlan, interval: Interval): string {
  const id = PRICE_IDS[plan][interval];
  if (!id) {
    throw new Error(`Missing Stripe price ID for ${plan}/${interval}`);
  }
  return id;
}

/** Reverse-map a Stripe price ID back to a plan + interval (null if unknown). */
export function planForPriceId(
  id: string
): { plan: PaidPlan; interval: Interval } | null {
  for (const plan of ["pro", "business"] as const) {
    for (const interval of ["monthly", "yearly"] as const) {
      if (PRICE_IDS[plan][interval] === id) {
        return { plan, interval };
      }
    }
  }
  return null;
}
