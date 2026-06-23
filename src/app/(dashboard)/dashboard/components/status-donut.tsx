"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface StatusDonutProps {
  active: number;
  cancelled: number;
}

const COLORS = ["#facc15", "#ef4444"];

export function StatusDonut({ active, cancelled }: StatusDonutProps) {
  const data = [
    { name: "Active", value: active },
    { name: "Cancelled", value: cancelled },
  ];

  const total = active + cancelled;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">
        Subscriptions by Status
      </h3>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
        <div className="relative h-40 w-40 shrink-0">
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
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{total}</span>
          </div>
        </div>
        <div className="w-full min-w-0 space-y-3 sm:flex-1">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-full bg-yellow-400" />
            <span className="text-sm text-gray-400">Active</span>
            <span className="ml-auto text-sm font-semibold text-white">
              {active}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-full bg-red-500" />
            <span className="text-sm text-gray-400">Cancelled</span>
            <span className="ml-auto text-sm font-semibold text-white">
              {cancelled}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
