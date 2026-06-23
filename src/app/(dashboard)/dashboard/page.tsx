import { requireAuth } from "@/lib/auth-guard";
import { getWorkspacePlan } from "@/lib/billing";
import { PlanBadge } from "@/components/plan-badge";
import type { Subscription } from "@/lib/supabase/types";
import { InsightsBanner } from "./components/insights-banner";
import { KpiBanner } from "./components/kpi-banner";
import { SpendTrendChart } from "./components/spend-trend-chart";
import { StatusDonut } from "./components/status-donut";
import { BillingCycleDonut } from "./components/billing-cycle-donut";
import { TopSubscriptionsChart } from "./components/top-subscriptions-chart";
import { UpcomingRenewalsCard } from "./components/upcoming-renewals-card";
import { CostByToolChart } from "./components/cost-by-tool-chart";
import { SeatUtilizationChart } from "./components/seat-utilization-chart";
import { LoginToast } from "./components/login-toast";
import { SignupConversion } from "./components/signup-conversion";
import { FilterBar } from "./components/filter-bar";

function monthlyEquivalent(sub: Subscription) {
  return sub.billing_cycle === "monthly" ? sub.price : sub.price / 12;
}

function yearlyEquivalent(sub: Subscription) {
  return sub.billing_cycle === "yearly" ? sub.price : sub.price * 12;
}

interface DashboardSearchParams {
  currency?: string;
  from?: string;
  to?: string;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const { supabase, profile } = await requireAuth();

  const fireSignupConversion = profile.signup_conversion_tracked === false;

  // These don't depend on each other — run them concurrently instead of
  // awaiting one round-trip after another.
  const [plan, { data: subscriptions }, params] = await Promise.all([
    getWorkspacePlan(supabase, profile.workspace_id),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("workspace_id", profile.workspace_id)
      .order("software_name", { ascending: true })
      .returns<Subscription[]>(),
    searchParams,
  ]);

  const allSubs = subscriptions ?? [];
  const currencies = [...new Set(allSubs.map((s) => s.currency))].sort();
  const filterCurrency = params.currency;
  const filterFrom = params.from;
  const filterTo = params.to;

  let subs = allSubs;
  if (filterCurrency) subs = subs.filter((s) => s.currency === filterCurrency);
  if (filterFrom) subs = subs.filter((s) => s.next_renewal_date >= filterFrom);
  if (filterTo) subs = subs.filter((s) => s.next_renewal_date <= filterTo);

  const displayCurrency = filterCurrency ?? currencies[0] ?? "USD";

  // ── KPI ────────────────────────────────────────────────────────────
  const activeSubs = subs.filter((s) => s.status === "active");
  const cancelledSubs = subs.filter((s) => s.status === "cancelled");
  const cancelledCount = cancelledSubs.length;
  const cancelledMonthlySavings = cancelledSubs.reduce(
    (sum, s) => sum + monthlyEquivalent(s),
    0
  );

  const totalMonthlySpend = activeSubs.reduce((sum, s) => sum + monthlyEquivalent(s), 0);
  const totalYearlySpend = activeSubs.reduce((sum, s) => sum + yearlyEquivalent(s), 0);
  const activeCount = activeSubs.length;

  // Month-over-month % change
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    .toISOString()
    .split("T")[0];
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    .toISOString()
    .split("T")[0];

  const thisMonthSubs = activeSubs.filter(
    (s) => s.created_at.split("T")[0] <= startOfThisMonth
  );
  const lastMonthSubs = activeSubs.filter(
    (s) =>
      s.created_at.split("T")[0] >= startOfLastMonth &&
      s.created_at.split("T")[0] <= endOfLastMonth
  );
  const thisMonthSpend = thisMonthSubs.reduce((sum, s) => sum + monthlyEquivalent(s), 0);
  const lastMonthSpend = lastMonthSubs.reduce((sum, s) => sum + monthlyEquivalent(s), 0);
  const monthlySpendChange =
    lastMonthSpend > 0
      ? ((thisMonthSpend - lastMonthSpend) / lastMonthSpend) * 100
      : null;

  // ── Renewals ───────────────────────────────────────────────────────
  const in30Days = new Date(now);
  in30Days.setDate(in30Days.getDate() + 30);
  const nowStr = now.toISOString().split("T")[0];
  const in30Str = in30Days.toISOString().split("T")[0];

  // Roll forward next_renewal_date if it's in the past
  const renewalSubs = activeSubs.map((s) => {
    const date = new Date(s.next_renewal_date + "T00:00:00");
    const today = new Date(nowStr + "T00:00:00");
    while (date < today) {
      if (s.billing_cycle === "monthly") {
        date.setMonth(date.getMonth() + 1);
      } else {
        date.setFullYear(date.getFullYear() + 1);
      }
    }
    return { ...s, next_renewal_date: date.toISOString().split("T")[0] };
  });

  const upcomingRenewals = renewalSubs
    .filter((s) => s.next_renewal_date >= nowStr && s.next_renewal_date <= in30Str)
    .sort(
      (a, b) =>
        new Date(a.next_renewal_date).getTime() -
        new Date(b.next_renewal_date).getTime()
    );

  // ── Spend trend ────────────────────────────────────────────────────
  const spendTrendData: { month: string; spend: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = d.toLocaleDateString("en-US", { month: "short" });
    const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];
    const subsAtMonth = activeSubs.filter(
      (s) => s.created_at.split("T")[0] <= endOfMonth
    );
    const spend = subsAtMonth.reduce((sum, s) => sum + monthlyEquivalent(s), 0);
    spendTrendData.push({ month: monthLabel, spend: Math.round(spend) });
  }

  // ── Status / Billing ───────────────────────────────────────────────
  const monthlyCost = activeSubs
    .filter((s) => s.billing_cycle === "monthly")
    .reduce((sum, s) => sum + s.price, 0);
  const yearlyCost = activeSubs
    .filter((s) => s.billing_cycle === "yearly")
    .reduce((sum, s) => sum + s.price, 0);

  // ── Top subscriptions ──────────────────────────────────────────────
  const topSubs = [...activeSubs]
    .sort((a, b) => monthlyEquivalent(b) - monthlyEquivalent(a))
    .slice(0, 5)
    .map((s) => ({ name: s.software_name, cost: Math.round(monthlyEquivalent(s)) }));

  // ── Cost by tool ───────────────────────────────────────────────────
  const toolSpendMap = new Map<string, number>();
  for (const s of activeSubs) {
    toolSpendMap.set(
      s.software_name,
      (toolSpendMap.get(s.software_name) ?? 0) + Math.round(monthlyEquivalent(s))
    );
  }
  const costByTool = [...toolSpendMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, spend]) => ({ name, spend }));

  // ── Seat utilization ───────────────────────────────────────────────
  const seatData = activeSubs.map((s) => ({ name: s.software_name, seats: s.seats }));

  // ── Empty state ────────────────────────────────────────────────────
  if (allSubs.length === 0) {
    return (
      <div className="space-y-6">
        <LoginToast />
        {fireSignupConversion && <SignupConversion />}
        <div className="relative flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <div className="sm:absolute sm:right-0">
            <PlanBadge plan={plan} />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-16 text-center">
          <p className="text-lg font-medium text-white">No subscriptions yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Add subscriptions to see your dashboard analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LoginToast />
      {fireSignupConversion && <SignupConversion />}
      <div className="relative flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="sm:absolute sm:right-0">
          <PlanBadge plan={plan} />
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        currencies={currencies}
        selectedCurrency={filterCurrency}
        from={filterFrom}
        to={filterTo}
      />

      {/* Insights – "where can I save right now?" */}
      <InsightsBanner subscriptions={subs} currency={displayCurrency} />

      {/* KPI Row – 4 cards */}
      <KpiBanner
        monthlySpend={totalMonthlySpend}
        yearlySpend={totalYearlySpend}
        activeCount={activeCount}
        cancelledCount={cancelledCount}
        cancelledMonthlySavings={cancelledMonthlySavings}
        monthlySpendChange={monthlySpendChange}
        currency={displayCurrency}
      />

      {/* Primary row – Upcoming Renewals + Cost by Tool */}
      <div className="grid gap-4 lg:grid-cols-2">
        <UpcomingRenewalsCard renewals={upcomingRenewals} currency={displayCurrency} />
        <CostByToolChart data={costByTool} currency={displayCurrency} />
      </div>

      {/* Secondary row – Spend Trend + Status */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SpendTrendChart data={spendTrendData} currency={displayCurrency} />
        <StatusDonut active={activeCount} cancelled={cancelledCount} />
      </div>

      {/* Third row – Billing Cycle + Top Subs */}
      <div className="grid gap-4 lg:grid-cols-2">
        <BillingCycleDonut
          monthlyCost={monthlyCost}
          yearlyCost={yearlyCost}
          currency={displayCurrency}
        />
        <TopSubscriptionsChart data={topSubs} currency={displayCurrency} />
      </div>

      {/* Fourth row – Seat Utilization */}
      <SeatUtilizationChart data={seatData} />
    </div>
  );
}
