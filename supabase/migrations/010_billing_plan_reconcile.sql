-- =====================
-- Reconcile workspace_billing.plan with the application vocabulary
--
-- The live `workspace_billing` table was created with a legacy plan
-- vocabulary: the free tier is stored as 'starter', and a CHECK constraint
-- (`workspace_billing_plan_check`) only permits ('starter', 'pro', 'business').
--
-- The application and 009_billing.sql use 'free' for the free tier. That
-- mismatch makes every write of plan='free' fail with a check-constraint
-- violation (SQLSTATE 23514) — which is why cancelling a subscription never
-- moved the account back to the free plan (`resetBillingToFree`), and why the
-- unknown-price fallback in `applySubscriptionToBilling` could not write.
--
-- This migration aligns the table with the code. It is idempotent — safe to
-- re-run, and a no-op on a database already created by 009_billing.sql.
-- =====================

-- Drop the constraint first so the data backfill below cannot be blocked by it.
alter table public.workspace_billing
  drop constraint if exists workspace_billing_plan_check;

-- Rename the legacy free-tier value to the one the application uses.
update public.workspace_billing
  set plan = 'free'
  where plan = 'starter';

-- Re-add the constraint with the application's plan vocabulary.
alter table public.workspace_billing
  add constraint workspace_billing_plan_check
  check (plan in ('free', 'pro', 'business'));

-- New workspaces should default to the free plan.
alter table public.workspace_billing
  alter column plan set default 'free';
