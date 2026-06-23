"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";

interface Feature {
  label: string;
  enabled: boolean;
  badge?: string;
}

interface FeatureGroup {
  label: string;
  items: Feature[];
}

interface Plan {
  name: string;
  description: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  yearlyBilled: string | null;
  customLabel?: string;
  customSub?: string;
  groups: FeatureGroup[];
  cta: string;
  href: string;
  ctaStyle: "primary" | "secondary" | "outline";
  featured?: boolean;
  badge?: string;
  roi?: string;
}

const plans: Plan[] = [
  {
    name: "Free",
    description: "For founders and solo operators tracking a small stack.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlyBilled: "Free forever",
    groups: [
      {
        label: "Tracking",
        items: [
          { label: "Track up to 5 tools", enabled: true },
          { label: "Spend overview dashboard", enabled: true },
          { label: "Renewal alerts", enabled: true },
          { label: "Import & export via file", enabled: true },
        ],
      },
      {
        label: "Team",
        items: [
          { label: "Team invites & roles", enabled: false },
          { label: "Automated review requests", enabled: false },
        ],
      },
      {
        label: "Insights",
        items: [
          { label: "Tool status tracking", enabled: false },
          { label: "Possible savings calculation", enabled: false },
        ],
      },
    ],
    cta: "Start tracking for free",
    href: "/signup",
    ctaStyle: "secondary",
  },
  {
    name: "Pro",
    description:
      "For small teams that want full visibility and control over their SaaS spend.",
    monthlyPrice: 19,
    yearlyPrice: 15,
    yearlyBilled: "Billed yearly ($180/year)",
    badge: "Most popular",
    featured: true,
    roi: "If Subiq helps you cut even one unused subscription, Pro pays for itself — and you keep the rest.",
    groups: [
      {
        label: "Tracking",
        items: [
          { label: "Unlimited tools", enabled: true },
          { label: "Spend overview dashboard", enabled: true },
          { label: "Renewal alerts & calendar", enabled: true },
          { label: "Import & export via file", enabled: true },
        ],
      },
      {
        label: "Team",
        items: [
          { label: "Team invites & roles", enabled: true, badge: "Pro" },
          {
            label: "Automated review requests",
            enabled: true,
            badge: "Pro",
          },
          {
            label: "Monthly or quarterly review cycles",
            enabled: true,
            badge: "Pro",
          },
        ],
      },
      {
        label: "Insights",
        items: [
          {
            label: "Active, unused & cancelled status",
            enabled: true,
            badge: "Pro",
          },
          {
            label: "Possible savings, auto-calculated",
            enabled: true,
            badge: "Pro",
          },
          { label: "Priority support", enabled: true },
        ],
      },
    ],
    cta: "Get Pro — start saving today",
    href: "/signup",
    ctaStyle: "primary",
  },
  {
    name: "Business",
    description: "For larger teams and organizations managing a complex tool stack.",
    monthlyPrice: 49,
    yearlyPrice: 39,
    yearlyBilled: "Billed yearly ($468/year)",
    groups: [
      {
        label: "Everything in Pro, plus",
        items: [
          { label: "Unlimited tools", enabled: true },
          { label: "Unlimited team members", enabled: true },
          { label: "Custom onboarding", enabled: true },
          { label: "Dedicated account support", enabled: true },
          { label: "Priority SLA support", enabled: true },
        ],
      },
    ],
    cta: "Get Business",
    href: "/signup",
    ctaStyle: "outline",
  },
];

export function PricingSection() {
  const [yearly, setYearly] = useState(true);

  return (
    <section
      id="pricing"
      className="relative scroll-mt-16 px-4 py-20 sm:py-24"
    >
      {/* Header */}
      <div className="mx-auto max-w-[580px] text-center">
        <span className="mb-6 inline-block rounded-full border border-white/[0.08] bg-white/10 px-[18px] py-2 text-[12px] font-medium uppercase tracking-[0.1em] text-gray-400">
          Pricing
        </span>
        <h2 className="font-display text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-4xl">
          Start free.{" "}
          <span className="text-yellow-400">Upgrade when your stack grows.</span>
        </h2>
        <p className="mt-4 text-base leading-[1.6] text-gray-400">
          No credit card required. No surprise charges. Cancel anytime.
        </p>

        {/* Trust pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-gray-400">
          {["No credit card needed", "Cancel anytime", "Set up in 2 minutes"].map(
            (label) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-400" />
                {label}
              </span>
            )
          )}
        </div>
      </div>

      {/* Toggle */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setYearly(false)}
          className={`text-sm transition-colors ${
            !yearly ? "font-medium text-white" : "text-gray-400"
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setYearly(!yearly)}
          aria-label="Toggle yearly billing"
          aria-pressed={yearly}
          className={`relative h-[26px] w-[52px] shrink-0 rounded-full transition-colors ${
            yearly ? "bg-yellow-400/30" : "bg-white/10"
          }`}
        >
          <span
            className={`absolute top-[3px] size-5 rounded-full bg-white shadow transition-[left] duration-200 ${
              yearly ? "left-[29px]" : "left-[3px]"
            }`}
          />
        </button>
        <button
          type="button"
          onClick={() => setYearly(true)}
          className={`text-sm transition-colors ${
            yearly ? "font-medium text-white" : "text-gray-400"
          }`}
        >
          Yearly
        </button>
        <span className="rounded-full bg-yellow-400/12 px-2.5 py-1 text-xs font-medium text-yellow-400">
          Save 20%
        </span>
      </div>

      {/* Cards */}
      <div className="relative mx-auto mt-10 grid max-w-5xl items-start gap-4 sm:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col gap-6 rounded-[18px] p-7 sm:p-8 ${
              plan.featured
                ? "border-2 border-yellow-400/50 bg-gradient-to-b from-yellow-400/[0.06] to-[#111110]"
                : "border border-white/[0.07] bg-[#111110]"
            }`}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400 px-4 py-1 text-xs font-medium text-[#1a1200] whitespace-nowrap">
                {plan.badge}
              </span>
            )}

            {/* Name + description */}
            <div className="flex flex-col gap-2">
              <div className="font-display text-[22px] font-bold text-white">
                {plan.name}
              </div>
              <p className="text-[13px] leading-[1.5] text-gray-500">
                {plan.description}
              </p>
            </div>

            {/* Price */}
            <div>
              <div className="flex items-baseline gap-1">
                {plan.monthlyPrice !== null ? (
                  <>
                    <span className="font-display text-[44px] font-extrabold leading-none text-white">
                      ${yearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-sm text-gray-500">/month</span>
                  </>
                ) : (
                  <span className="font-display text-[32px] font-extrabold leading-none text-white">
                    {plan.customLabel}
                  </span>
                )}
              </div>
              <p className="mt-1 min-h-[18px] text-xs text-gray-500">
                {plan.monthlyPrice !== null
                  ? yearly
                    ? plan.yearlyBilled
                    : plan.monthlyPrice === 0
                      ? plan.yearlyBilled
                      : "Billed monthly"
                  : plan.customSub}
              </p>
            </div>

            {/* ROI box */}
            {plan.roi && (
              <div className="rounded-[10px] border border-emerald-400/15 bg-emerald-400/[0.08] px-3.5 py-3 text-[13px] leading-[1.5] text-emerald-300/85">
                <strong className="font-medium text-emerald-400">
                  The math:
                </strong>{" "}
                {plan.roi}
              </div>
            )}

            {/* Features */}
            <div className="flex flex-1 flex-col border-t border-white/[0.06] pt-5">
              {plan.groups.map((group) => (
                <div key={group.label}>
                  <p className="pb-1.5 pt-3 text-[11px] uppercase tracking-[0.08em] text-gray-600 first:pt-0">
                    {group.label}
                  </p>
                  {group.items.map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2.5 py-1.5 text-[13px] ${
                        item.enabled ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      <span
                        className={`flex w-4 shrink-0 justify-center text-sm ${
                          item.enabled ? "text-emerald-400" : "text-white/15"
                        }`}
                      >
                        {item.enabled ? (
                          <Check className="size-3.5" />
                        ) : (
                          <span>—</span>
                        )}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-yellow-400/12 px-2 py-0.5 text-[10px] text-yellow-400">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link
              href={plan.href}
              className={`block w-full rounded-full px-6 py-3.5 text-center text-[15px] font-medium transition-all hover:-translate-y-0.5 ${
                plan.ctaStyle === "primary"
                  ? "bg-yellow-400 text-[#1a1200] hover:bg-yellow-300"
                  : plan.ctaStyle === "secondary"
                    ? "border border-white/10 bg-white/[0.07] text-gray-300 hover:bg-white/12"
                    : "border border-white/12 bg-transparent text-gray-400 hover:border-white/25 hover:text-white"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* Bottom messaging */}
      <div className="mx-auto mt-10 flex max-w-[520px] flex-col items-center gap-3 text-center">
        <p className="text-sm leading-[1.6] text-gray-500">
          All plans include renewal alerts, spend dashboard, and import/export.
          Upgrade, downgrade, or cancel at any time.
        </p>
        <p className="rounded-[10px] border border-white/[0.06] bg-white/[0.03] px-6 py-3.5 text-[13px] leading-[1.6] text-gray-500">
          Pro pays for itself the moment you cancel{" "}
          <strong className="font-medium text-yellow-400/80">
            one subscription nobody&apos;s using
          </strong>
          . Set up in minutes — and start spotting what your team can cut from
          day one.
        </p>
      </div>
    </section>
  );
}
