-- Manual "Unused" flag surfaced in the Insights banner on the dashboard.
-- Default false so existing rows remain active in every insight calculation.
alter table public.subscriptions
  add column if not exists is_unused boolean not null default false;

-- Partial index: only flagged rows need to be scanned when computing the
-- "unused waste" tile, which is a small subset of total subscriptions.
create index if not exists idx_subscriptions_is_unused
  on public.subscriptions (workspace_id, is_unused)
  where is_unused = true;
