"use client";

import { useState, useTransition } from "react";
import { Check, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { PLAN_PRICING, type Plan } from "@/lib/plans";

type Interval = "monthly" | "yearly";
type PaidPlan = "pro" | "business";

interface PlanCard {
  id: Plan;
  name: string;
  blurb: string;
  features: string[];
}

const PLAN_CARDS: PlanCard[] = [
  {
    id: "free",
    name: "Free",
    blurb: "For solo operators tracking a small stack.",
    features: [
      "Up to 5 tracked tools",
      "1 team member",
      "Spend dashboard & renewal alerts",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    blurb: "Full visibility for small teams.",
    features: [
      "Unlimited tracked tools",
      "Up to 10 team members",
      "CSV import & export",
      "Priority support",
    ],
  },
  {
    id: "business",
    name: "Business",
    blurb: "For organizations with a complex stack.",
    features: [
      "Unlimited tracked tools",
      "Unlimited team members",
      "CSV import & export",
      "Dedicated support",
    ],
  },
];

/**
 * Plan picker. On the free plan it shows all three plans so an admin can
 * upgrade through Stripe Checkout. Once a paid plan is active it shows only
 * that plan — no switching from here.
 */
export function PlanSelector({
  currentPlan,
  canManage,
  billingCycle,
}: {
  currentPlan: Plan;
  canManage: boolean;
  billingCycle?: Interval | null;
}) {
  const [interval, setIntervalChoice] = useState<Interval>(
    billingCycle ?? "monthly"
  );
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  const onPaidPlan = currentPlan !== "free";

  function startCheckout(plan: PaidPlan) {
    setBusy(plan);
    startTransition(async () => {
      try {
        const res = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, interval }),
        });
        const data = await res.json();
        if (!res.ok || !data.url) {
          throw new Error(data.error ?? "Could not start checkout");
        }
        window.location.href = data.url as string;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Could not start checkout"
        );
        setBusy(null);
      }
    });
  }

  const primaryBtn =
    "mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60";
  const secondaryBtn =
    "mt-5 inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.07] px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-60";
  const activeBtn =
    "mt-5 inline-flex cursor-default items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm font-medium text-emerald-400";

  function renderCta(card: PlanCard, isActive: boolean) {
    if (isActive) {
      return (
        <button type="button" disabled className={activeBtn}>
          Current plan
        </button>
      );
    }
    if (!canManage) {
      return (
        <button type="button" disabled className={secondaryBtn}>
          Admins only
        </button>
      );
    }
    // Reachable only on the free plan — start a checkout for a paid plan.
    return (
      <button
        type="button"
        onClick={() => startCheckout(card.id as PaidPlan)}
        disabled={busy !== null}
        className={primaryBtn}
      >
        {busy === card.id && <Loader2Icon className="size-4 animate-spin" />}
        {busy === card.id ? "Redirecting…" : `Upgrade to ${card.name}`}
      </button>
    );
  }

  // Once on a paid plan, only that plan is shown.
  const visibleCards = onPaidPlan
    ? PLAN_CARDS.filter((card) => card.id === currentPlan)
    : PLAN_CARDS;

  return (
    <div className="mt-4">
      {/* Billing interval toggle — only while choosing a plan. */}
      {!onPaidPlan && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIntervalChoice("monthly")}
            className={`text-sm transition-colors ${
              interval === "monthly" ? "font-medium text-white" : "text-gray-400"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() =>
              setIntervalChoice(interval === "monthly" ? "yearly" : "monthly")
            }
            aria-label="Toggle yearly billing"
            aria-pressed={interval === "yearly"}
            className={`relative h-[26px] w-[52px] shrink-0 rounded-full transition-colors ${
              interval === "yearly" ? "bg-yellow-400/30" : "bg-white/10"
            }`}
          >
            <span
              className={`absolute top-[3px] size-5 rounded-full bg-white shadow transition-[left] duration-200 ${
                interval === "yearly" ? "left-[29px]" : "left-[3px]"
              }`}
            />
          </button>
          <button
            type="button"
            onClick={() => setIntervalChoice("yearly")}
            className={`text-sm transition-colors ${
              interval === "yearly" ? "font-medium text-white" : "text-gray-400"
            }`}
          >
            Yearly
          </button>
          <span className="rounded-full bg-yellow-400/12 px-2.5 py-1 text-xs font-medium text-yellow-400">
            Save 20%
          </span>
        </div>
      )}

      {/* Plan cards */}
      <div
        className={`grid gap-4 ${
          onPaidPlan ? "max-w-sm" : "mt-4 sm:grid-cols-3"
        }`}
      >
        {visibleCards.map((card) => {
          const isActive = card.id === currentPlan;
          const price = PLAN_PRICING[card.id][interval];
          return (
            <div
              key={card.id}
              className={`flex flex-col rounded-xl border p-5 ${
                isActive
                  ? "border-yellow-400/50 bg-yellow-400/[0.06]"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-white">
                  {card.name}
                </h3>
                {isActive && (
                  <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                    Active
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-gray-500">{card.blurb}</p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">
                  ${price}
                </span>
                <span className="text-sm text-gray-500">/month</span>
              </div>
              <p className="mt-0.5 min-h-[16px] text-xs text-gray-500">
                {card.id !== "free" && interval === "yearly"
                  ? "billed yearly"
                  : ""}
              </p>
              <ul className="mt-4 flex-1 space-y-2">
                {card.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-gray-300"
                  >
                    <Check className="size-3.5 shrink-0 text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              {renderCta(card, isActive)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
