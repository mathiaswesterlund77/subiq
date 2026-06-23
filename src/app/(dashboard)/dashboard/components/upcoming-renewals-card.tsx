"use client";

interface Renewal {
  id: string;
  software_name: string;
  price: number;
  billing_cycle: string;
  next_renewal_date: string;
}

interface UpcomingRenewalsCardProps {
  renewals: Renewal[];
  currency: string;
}

const DOT_COLORS = [
  "#a855f7",
  "#ec4899",
  "#e2e8f0",
  "#eab308",
  "#3b82f6",
  "#22c55e",
  "#f97316",
  "#06b6d4",
];

function daysUntil(dateString: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDays(days: number) {
  if (days <= 0) return { label: "Today", yellow: true };
  if (days === 1) return { label: "Tomorrow", yellow: true };
  return { label: `in ${days} days`, yellow: false };
}

export function UpcomingRenewalsCard({
  renewals,
  currency,
}: UpcomingRenewalsCardProps) {
  function fmt(n: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(n);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <h3 className="mb-4 text-base font-semibold text-white">
        Upcoming Renewals
      </h3>

      {renewals.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          No renewals in the next 30 days
        </p>
      ) : (
        <div className="max-h-[304px] space-y-3 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {renewals.map((r, i) => {
            const days = daysUntil(r.next_renewal_date);
            const { label, yellow } = formatDays(days);
            const color = DOT_COLORS[i % DOT_COLORS.length];
            return (
              <div key={r.id} className="flex items-center gap-3">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
                  {r.software_name}
                </span>
                <span className="shrink-0 text-sm text-gray-400">
                  {fmt(r.price)}
                </span>
                <span
                  className={`shrink-0 text-right text-sm font-semibold ${
                    yellow ? "text-yellow-400" : "text-gray-500"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
