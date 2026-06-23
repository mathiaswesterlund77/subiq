"use client";

import { TrendingUp } from "lucide-react";

interface CostForecastCardProps {
  currentMonthly: number;
  projectedMonthly: number;
  currency: string;
}

export function CostForecastCard({
  currentMonthly,
  projectedMonthly,
  currency,
}: CostForecastCardProps) {
  function fmt(n: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(n);
  }

  const diff = projectedMonthly - currentMonthly;
  const pct = currentMonthly > 0 ? ((diff / currentMonthly) * 100).toFixed(1) : "0";
  const isUp = diff >= 0;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">Cost Forecast</h3>
      <p className="text-xs text-gray-500">Projected next month based on active subscriptions</p>

      <div className="mt-6 flex items-end gap-8">
        <div>
          <p className="text-xs text-gray-500">Current</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {fmt(currentMonthly)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Projected</p>
          <p className="mt-1 text-2xl font-bold text-yellow-400">
            {fmt(projectedMonthly)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <TrendingUp
          className={`h-4 w-4 ${isUp ? "text-red-400" : "text-yellow-400"}`}
        />
        <span
          className={`text-sm font-medium ${isUp ? "text-red-400" : "text-yellow-400"}`}
        >
          {isUp ? "+" : ""}
          {pct}%
        </span>
        <span className="text-xs text-gray-500">vs current month</span>
      </div>
    </div>
  );
}
