"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface CostByToolChartProps {
  data: { name: string; spend: number }[];
  currency: string;
}

const COLORS = [
  "#3b82f6",
  "#22c55e",
  "#eab308",
  "#ef4444",
  "#a855f7",
  "#f97316",
  "#06b6d4",
  "#ec4899",
];

export function CostByToolChart({
  data,
  currency,
}: CostByToolChartProps) {
  function fmt(n: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(n);
  }

  const total = data.reduce((sum, d) => sum + d.spend, 0);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <h3 className="mb-4 text-base font-semibold text-white">
        Cost by Tool
      </h3>

      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">No data</p>
      ) : (
        <div className="flex flex-col items-center gap-5">
          {/* Donut */}
          <div className="h-40 w-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="spend"
                  strokeWidth={0}
                >
                  {data.map((_, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [fmt(Number(value)), "Spend"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="w-full space-y-2">
            {data.slice(0, 6).map((item, i) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="flex-1 text-sm text-gray-400">
                  {item.name}
                </span>
                <span className="text-sm font-medium text-white">
                  {fmt(item.spend)}
                </span>
                <span className="w-10 text-right text-xs text-gray-600">
                  {total > 0 ? Math.round((item.spend / total) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
