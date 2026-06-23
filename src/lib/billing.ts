import type { SupabaseClient } from "@supabase/supabase-js";
import type { BillingPlan, WorkspaceBilling } from "@/lib/supabase/types";
import { normalizePlan } from "@/lib/plans";

/**
 * Fetch the billing row for a workspace, or `null` if there is none.
 * Pass the caller's Supabase client so the query runs under the right session.
 */
export async function getWorkspaceBilling(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<WorkspaceBilling | null> {
  const { data } = await supabase
    .from("workspace_billing")
    .select("*")
    .eq("workspace_id", workspaceId)
    .maybeSingle<WorkspaceBilling>();
  return data ?? null;
}

/**
 * The effective plan for a workspace — defaults to `free` when no row exists
 * or the stored value is not a recognized plan.
 */
export async function getWorkspacePlan(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<BillingPlan> {
  const billing = await getWorkspaceBilling(supabase, workspaceId);
  return normalizePlan(billing?.plan);
}
