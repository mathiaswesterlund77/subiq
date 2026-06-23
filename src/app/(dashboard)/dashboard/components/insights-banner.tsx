import { CalendarClock, BellRing, TrendingUp, CircleOff } from "lucide-react";
import type { Subscription } from "@/lib/supabase/types";

interface InsightsBannerProps {
  subscriptions: Subscription[];
  currency: string;
}

function monthlyEquivalent(sub: Subscription) {
  return sub.billing_cycle === "monthly" ? sub.price : sub.price / 12;
}

function rollForwardRenewal(sub: Subscription, today: Date): Date {
  const date = new Date(sub.next_renewal_date + "T00:00:00");
  while (date < today) {
    if (sub.billing_cycle === "monthly") {
      date.setMonth(date.getMonth() + 1);
    } else {
      date.setFullYear(date.getFullYear() + 1);
    }
  }
  return date;
}

export function InsightsBanner({ subscriptions, currency }: InsightsBannerProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  const activeSubs = subscriptions.filter((s) => s.status === "active");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in7Days = new Date(today);
  in7Days.setDate(in7Days.getDate() + 7);

  const upcoming7d = activeSubs.filter((s) => {
    const next = rollForwardRenewal(s, today);
    return next >= today && next <= in7Days;
  });
  const upcoming7dTotal = upcoming7d.reduce((sum, s) => sum + s.price, 0);
  const renewalsSoonCount = upcoming7d.length;

  const totalMonthlySpend = activeSubs.reduce(
    (sum, s) => sum + monthlyEquivalent(s),
    0
  );
  const topSub = activeSubs.reduce<Subscription | null>((top, s) => {
    if (!top) return s;
    return monthlyEquivalent(s) > monthlyEquivalent(top) ? s : top;
  }, null);
  const topSubShare =
    topSub && totalMonthlySpend > 0
      ? (monthlyEquivalent(topSub) / totalMonthlySpend) * 100
      : 0;

  const unusedSubs = activeSubs.filter((s) => s.is_unused);
  const unusedCount = unusedSubs.length;
  const unusedMonthlyCost = unusedSubs.reduce(
    (sum, s) => sum + monthlyEquivalent(s),
    0
  );

  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_12px_28px_-16px_rgba(0,0,0,0.6)]">
      <h2 className="mb-4 text-base font-semibold text-white">Insights</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile
          icon={<CalendarClock className="size-4" />}
          label="Upcoming charges (7d)"
          primary={upcoming7dTotal > 0 ? fmt(upcoming7dTotal) : "—"}
          secondary={
            upcoming7dTotal > 0
              ? `You will be charged ${fmt(upcoming7dTotal)} in the next 7 days`
              : "No charges coming up this week"
          }
          accent="yellow"
        />
        <Tile
          icon={<BellRing className="size-4" />}
          label="Renewals soon"
          primary={String(renewalsSoonCount)}
          secondary={
            renewalsSoonCount === 0
              ? "Nothing renewing this week"
              : renewalsSoonCount === 1
                ? "1 subscription renews in the next 7 days"
                : `${renewalsSoonCount} subscriptions renew in the next 7 days`
          }
          accent="blue"
        />
        <Tile
          icon={<TrendingUp className="size-4" />}
          label="Top expense"
          primary={topSub ? topSub.software_name : "—"}
          secondary={
            topSub
              ? `${topSubShare.toFixed(0)}% of total monthly spend`
              : "No active subscriptions"
          }
          accent="purple"
        />
        <Tile
          icon={<CircleOff className="size-4" />}
          label="Unused waste"
          primary={
            unusedCount === 0
              ? "0"
              : `${unusedCount} · ${fmt(unusedMonthlyCost)}/mo`
          }
          secondary={
            unusedCount === 0
              ? "No subscriptions flagged as unused"
              : `${fmt(unusedMonthlyCost * 12)} / year flagged as unused`
          }
          accent="red"
        />
      </div>
    </section>
  );
}

type TileAccent = "yellow" | "blue" | "purple" | "red";

const ACCENT_STYLES: Record<
  TileAccent,
  { ring: string; icon: string; glow: string }
> = {
  yellow: {
    ring: "ring-yellow-400/20",
    icon: "text-yellow-400 bg-yellow-400/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_4px_10px_-4px_rgba(250,204,21,0.5)]",
    glow: "before:bg-yellow-400/10",
  },
  blue: {
    ring: "ring-blue-400/20",
    icon: "text-blue-400 bg-blue-400/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_4px_10px_-4px_rgba(96,165,250,0.5)]",
    glow: "before:bg-blue-400/10",
  },
  purple: {
    ring: "ring-purple-400/20",
    icon: "text-purple-400 bg-purple-400/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_4px_10px_-4px_rgba(192,132,252,0.5)]",
    glow: "before:bg-purple-400/10",
  },
  red: {
    ring: "ring-red-400/20",
    icon: "text-red-400 bg-red-400/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_4px_10px_-4px_rgba(248,113,113,0.5)]",
    glow: "before:bg-red-400/10",
  },
};

function Tile({
  icon,
  label,
  primary,
  secondary,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  primary: string;
  secondary: string;
  accent: TileAccent;
}) {
  const styles = ACCENT_STYLES[accent];
  return (
    <div
      className={`group relative overflow-hidden rounded-xl bg-gradient-to-b from-white/[0.08] via-white/[0.04] to-white/[0.01] p-4 ring-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),inset_0_-1px_0_0_rgba(0,0,0,0.3),0_10px_24px_-12px_rgba(0,0,0,0.7)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),inset_0_-1px_0_0_rgba(0,0,0,0.3),0_18px_32px_-12px_rgba(0,0,0,0.8)] before:pointer-events-none before:absolute before:-top-8 before:-right-8 before:size-24 before:rounded-full before:opacity-60 before:blur-2xl ${styles.ring} ${styles.glow}`}
    >
      <div className="relative flex items-center gap-2">
        <span
          className={`flex size-7 items-center justify-center rounded-lg ${styles.icon}`}
        >
          {icon}
        </span>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {label}
        </p>
      </div>
      <p
        className="relative mt-3 truncate text-xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]"
        title={primary}
      >
        {primary}
      </p>
      <p className="relative mt-1 text-xs leading-snug text-gray-500">
        {secondary}
      </p>
    </div>
  );
}
