"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface TopSubscriptionsChartProps {
  data: { name: string; cost: number }[];
  currency: string;
}

export function TopSubscriptionsChart({
  data,
  currency,
}: TopSubscriptionsChartProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          Top Subscriptions
        </h3>
        <span className="text-xs text-gray-500">By monthly cost</span>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barCategoryGap="20%">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "#d1d5db", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={90}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value) => [
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency,
                }).format(Number(value)),
                "Cost",
              ]}
            />
            <Bar dataKey="cost" fill="#facc15" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
