import Link from "next/link";
import { requireAuth } from "@/lib/auth-guard";
import { getWorkspacePlan } from "@/lib/billing";
import { PLAN_LIMITS } from "@/lib/plans";
import type { Subscription } from "@/lib/supabase/types";
import { SubscriptionFormDialog } from "./components/subscription-form-dialog";
import { DeleteConfirmDialog } from "./components/delete-confirm-dialog";
import { CsvExportButton } from "./components/csv-export-button";
import { CsvImportDialog } from "./components/csv-import-dialog";
import { Pagination } from "./components/pagination";
import { UnusedToggle } from "./components/unused-toggle";

const PER_PAGE = 10;

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { supabase, profile } = await requireAuth();

  const isAdmin = profile.role === "admin";

  // Independent reads — fetch concurrently rather than in series.
  const [plan, { data: subscriptions }, params] = await Promise.all([
    getWorkspacePlan(supabase, profile.workspace_id),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("workspace_id", profile.workspace_id)
      .order("created_at", { ascending: false })
      .returns<Subscription[]>(),
    searchParams,
  ]);
  const limits = PLAN_LIMITS[plan];

  const allSubs = subscriptions ?? [];
  const atToolLimit =
    limits.maxTools !== Infinity && allSubs.length >= limits.maxTools;

  // Pagination
  const currentPage = Math.max(1, Number(params.page) || 1);
  const totalPages = Math.max(1, Math.ceil(allSubs.length / PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const subs = allSubs.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  /** Roll forward next_renewal_date if it's in the past */
  function getNextRenewalDate(sub: Subscription): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const date = new Date(sub.next_renewal_date + "T00:00:00");

    while (date < today) {
      if (sub.billing_cycle === "monthly") {
        date.setMonth(date.getMonth() + 1);
      } else {
        date.setFullYear(date.getFullYear() + 1);
      }
    }

    return date.toISOString().split("T")[0];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
        <div className="flex flex-wrap items-center gap-2">
          {limits.csv && <CsvExportButton subscriptions={allSubs} />}
          {isAdmin && limits.csv && <CsvImportDialog />}
          {isAdmin &&
            (atToolLimit ? (
              <Link
                href="/billing"
                className="inline-flex items-center justify-center rounded-lg bg-yellow-400 px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-yellow-300"
              >
                Upgrade to add more
              </Link>
            ) : (
              <SubscriptionFormDialog mode="add" />
            ))}
        </div>
      </div>

      {atToolLimit && (
        <div className="rounded-lg border border-yellow-400/20 bg-yellow-400/[0.06] px-4 py-3 text-sm text-yellow-200/90">
          You&apos;ve reached your plan&apos;s limit of {limits.maxTools}{" "}
          tracked tools.{" "}
          <Link
            href="/billing"
            className="font-medium text-yellow-400 underline"
          >
            Upgrade
          </Link>{" "}
          to add more.
        </div>
      )}

      {allSubs.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-16 text-center">
          <p className="text-lg font-medium text-white">
            No subscriptions yet
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {isAdmin
              ? 'Click "Add Subscription" to get started.'
              : "Your subscriptions will appear here once added."}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            {allSubs.length} subscription{allSubs.length !== 1 ? "s" : ""}
          </p>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                      Name
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                      Price
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                      Cycle
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                      Seats
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                      Start Date
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                      Next Renewal Date
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                      Status
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                      Unused
                    </th>
                    {isAdmin && (
                      <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {subs.map((sub) => (
                    <tr
                      key={sub.id}
                      className="transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-white sm:px-6">
                        <span className="flex items-center gap-2">
                          <span
                            aria-hidden
                            className={`size-2 shrink-0 rounded-full sm:hidden ${
                              sub.status === "active"
                                ? "bg-yellow-400"
                                : "bg-gray-500"
                            }`}
                          />
                          {sub.software_name}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300 sm:px-6">
                        {formatCurrency(sub.price, sub.currency)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm capitalize text-gray-300 sm:px-6">
                        {sub.billing_cycle}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-center text-sm text-gray-300 sm:px-6">
                        {sub.seats}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300 sm:px-6">
                        {formatDate(sub.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300 sm:px-6">
                        {formatDate(getNextRenewalDate(sub))}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 sm:px-6">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium capitalize ${
                            sub.status === "active"
                              ? "bg-yellow-400/10 text-yellow-400"
                              : "bg-white/10 text-gray-400"
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-center sm:px-6">
                        {isAdmin ? (
                          <div className="flex justify-center">
                            <UnusedToggle
                              subscriptionId={sub.id}
                              softwareName={sub.software_name}
                              isUnused={sub.is_unused}
                            />
                          </div>
                        ) : sub.is_unused ? (
                          <span className="inline-block rounded-md bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-400">
                            Unused
                          </span>
                        ) : (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="whitespace-nowrap px-3 py-4 text-right sm:px-6">
                          <div className="flex items-center justify-end gap-1">
                            <SubscriptionFormDialog
                              mode="edit"
                              subscription={sub}
                            />
                            <DeleteConfirmDialog
                              subscriptionId={sub.id}
                              softwareName={sub.software_name}
                            />
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={allSubs.length}
            perPage={PER_PAGE}
          />
        </>
      )}
    </div>
  );
}
