-- =====================
-- Stripe subscription billing
--
-- Written idempotently so it can be safely re-run if a previous attempt
-- partially applied.
-- =====================

-- workspace_billing: one row per workspace, holding its current plan and
-- Stripe linkage. Written exclusively by the Stripe webhook (service role);
-- workspace members may only read their own row.
create table if not exists public.workspace_billing (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'business')),
  status text not null default 'active' check (status in ('active', 'past_due', 'canceled')),
  billing_cycle text check (billing_cycle in ('monthly', 'yearly')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists workspace_billing_customer_idx
  on public.workspace_billing (stripe_customer_id);

-- billing_invoices: payment history synced from Stripe.
create table if not exists public.billing_invoices (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  stripe_invoice_id text not null unique,
  amount_paid integer not null,
  currency text not null,
  status text not null,
  invoice_pdf text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists billing_invoices_workspace_idx
  on public.billing_invoices (workspace_id);

-- =====================
-- Row Level Security
-- =====================

alter table public.workspace_billing enable row level security;
alter table public.billing_invoices enable row level security;

-- Read-only for members. The webhook writes with the service role, which
-- bypasses RLS, so no INSERT/UPDATE policies are needed.
drop policy if exists "Users can view their workspace billing" on public.workspace_billing;
create policy "Users can view their workspace billing"
  on public.workspace_billing for select
  using (workspace_id = public.get_user_workspace_id());

drop policy if exists "Users can view their workspace invoices" on public.billing_invoices;
create policy "Users can view their workspace invoices"
  on public.billing_invoices for select
  using (workspace_id = public.get_user_workspace_id());

-- =====================
-- Triggers
-- =====================

-- Keep updated_at fresh (reuses the function from 001_initial_schema.sql).
drop trigger if exists workspace_billing_updated_at on public.workspace_billing;
create trigger workspace_billing_updated_at
  before update on public.workspace_billing
  for each row execute function public.update_updated_at();

-- Give every new workspace a default free billing row.
create or replace function public.create_workspace_billing()
returns trigger as $$
begin
  insert into public.workspace_billing (workspace_id)
  values (new.id)
  on conflict (workspace_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_workspace_created on public.workspaces;
create trigger on_workspace_created
  after insert on public.workspaces
  for each row execute function public.create_workspace_billing();

-- Backfill billing rows for workspaces that already exist.
insert into public.workspace_billing (workspace_id)
select id from public.workspaces
on conflict (workspace_id) do nothing;
