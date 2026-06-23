"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface BillingCycleDonutProps {
  monthlyCost: number;
  yearlyCost: number;
  currency: string;
}

const COLORS = ["#818cf8", "#facc15"];

export function BillingCycleDonut({
  monthlyCost,
  yearlyCost,
  currency,
}: BillingCycleDonutProps) {
  const data = [
    { name: "Monthly", value: monthlyCost },
    { name: "Yearly", value: yearlyCost },
  ];

  function fmt(n: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(n);
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">
        Cost by Billing Cycle
      </h3>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
        <div className="h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value) => fmt(Number(value))}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full min-w-0 space-y-3 sm:flex-1">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-full bg-indigo-400" />
            <span className="text-sm text-gray-400">Monthly</span>
            <span className="ml-auto text-sm font-semibold text-white">
              {fmt(monthlyCost)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-full bg-yellow-400" />
            <span className="text-sm text-gray-400">Yearly</span>
            <span className="ml-auto text-sm font-semibold text-white">
              {fmt(yearlyCost)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
