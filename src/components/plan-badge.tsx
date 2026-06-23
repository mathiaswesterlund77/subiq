import Link from "next/link";
import { Sparkles } from "lucide-react";
import { PLAN_LABELS, type Plan } from "@/lib/plans";

const STYLES: Record<Plan, string> = {
  free: "border-white/15 bg-white/5 text-gray-300",
  pro: "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
  business: "border-violet-400/30 bg-violet-400/10 text-violet-200",
};

/** Compact, clickable indicator of the workspace's current plan. */
export function PlanBadge({ plan }: { plan: Plan }) {
  return (
    <Link
      href="/billing"
      title="View billing & plan"
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-opacity hover:opacity-80 ${STYLES[plan]}`}
    >
      <Sparkles className="size-3.5" />
      {PLAN_LABELS[plan]} plan
    </Link>
  );
}
