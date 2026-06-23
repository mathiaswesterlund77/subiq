"use client";

interface KpiBannerProps {
  monthlySpend: number;
  yearlySpend: number;
  activeCount: number;
  cancelledCount: number;
  cancelledMonthlySavings: number;
  monthlySpendChange: number | null;
  currency: string;
}

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function KpiBanner({
  monthlySpend,
  yearlySpend,
  activeCount,
  cancelledCount,
  cancelledMonthlySavings,
  monthlySpendChange,
  currency,
}: KpiBannerProps) {
  const changeIsPositive = monthlySpendChange !== null && monthlySpendChange >= 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Monthly Spend */}
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] via-white/[0.04] to-white/[0.01] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),inset_0_-1px_0_0_rgba(0,0,0,0.3),0_12px_28px_-14px_rgba(0,0,0,0.7)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),inset_0_-1px_0_0_rgba(0,0,0,0.3),0_20px_36px_-14px_rgba(0,0,0,0.8)]">
        <p className="text-sm text-gray-400">Monthly Spend</p>
        <div className="mt-2 flex items-end gap-2">
          <p className="text-3xl font-bold text-white">
            {fmt(monthlySpend, currency)}
          </p>
          {monthlySpendChange !== null && (
            <span
              className={`mb-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
                changeIsPositive
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {changeIsPositive ? "+" : ""}
              {monthlySpendChange.toFixed(0)}%
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-600">vs last month</p>
      </div>

      {/* Yearly Cost */}
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] via-white/[0.04] to-white/[0.01] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),inset_0_-1px_0_0_rgba(0,0,0,0.3),0_12px_28px_-14px_rgba(0,0,0,0.7)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),inset_0_-1px_0_0_rgba(0,0,0,0.3),0_20px_36px_-14px_rgba(0,0,0,0.8)]">
        <p className="text-sm text-gray-400">Yearly Cost</p>
        <p className="mt-2 text-3xl font-bold text-white">
          {fmt(yearlySpend, currency)}
        </p>
        <p className="mt-1 text-xs text-gray-600">projected annual spend</p>
      </div>

      {/* Active Tools */}
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] via-white/[0.04] to-white/[0.01] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),inset_0_-1px_0_0_rgba(0,0,0,0.3),0_12px_28px_-14px_rgba(0,0,0,0.7)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),inset_0_-1px_0_0_rgba(0,0,0,0.3),0_20px_36px_-14px_rgba(0,0,0,0.8)]">
        <p className="text-sm text-gray-400">Active Tools</p>
        <p className="mt-2 text-3xl font-bold text-white">{activeCount}</p>
        <p className="mt-1 text-xs text-gray-600">subscriptions tracked</p>
      </div>

      {/* Cancelled Tools */}
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] via-white/[0.04] to-white/[0.01] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),inset_0_-1px_0_0_rgba(0,0,0,0.3),0_12px_28px_-14px_rgba(0,0,0,0.7)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),inset_0_-1px_0_0_rgba(0,0,0,0.3),0_20px_36px_-14px_rgba(0,0,0,0.8)]">
        <p className="text-sm text-gray-400">Cancelled Tools</p>
        <p className="mt-2 text-3xl font-bold text-white">{cancelledCount}</p>
        <p className="mt-1 text-xs text-gray-600">
          {cancelledCount === 0
            ? "no cancellations"
            : `${fmt(cancelledMonthlySavings, currency)}/mo`}
        </p>
      </div>
    </div>
  );
}
