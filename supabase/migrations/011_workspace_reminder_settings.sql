-- =====================
-- Review reminders
--
-- Lets a workspace admin schedule a recurring email that nudges the team to
-- review their SaaS subscriptions. One settings row per workspace; a daily
-- Vercel cron (/api/cron/review-reminders) reads enabled rows and sends.
--
-- Written idempotently so it can be safely re-run if a previous attempt
-- partially applied.
-- =====================

create table if not exists public.workspace_reminder_settings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null unique,
  enabled boolean not null default false,
  frequency text not null default 'monthly' check (frequency in ('monthly', 'quarterly')),
  send_day integer not null default 1 check (send_day between 1 and 28),
  recipient_roles text[] not null default array['admin', 'member']::text[],
  last_sent_at timestamptz,
  next_send_at date,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

-- Speeds up the daily cron's "which workspaces are due" lookup.
create index if not exists workspace_reminder_settings_due_idx
  on public.workspace_reminder_settings (next_send_at) where enabled;

-- =====================
-- Row Level Security
-- =====================

alter table public.workspace_reminder_settings enable row level security;

-- Members may read their own workspace's settings.
drop policy if exists "Users can view their workspace reminder settings" on public.workspace_reminder_settings;
create policy "Users can view their workspace reminder settings"
  on public.workspace_reminder_settings for select
  using (workspace_id = public.get_user_workspace_id());

-- Admins may create their workspace's settings row (covers the upsert path).
drop policy if exists "Admins can insert workspace reminder settings" on public.workspace_reminder_settings;
create policy "Admins can insert workspace reminder settings"
  on public.workspace_reminder_settings for insert
  with check (
    workspace_id = public.get_user_workspace_id()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Admins may update their workspace's settings row.
drop policy if exists "Admins can update workspace reminder settings" on public.workspace_reminder_settings;
create policy "Admins can update workspace reminder settings"
  on public.workspace_reminder_settings for update
  using (
    workspace_id = public.get_user_workspace_id()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (workspace_id = public.get_user_workspace_id());

-- The daily cron writes last_sent_at / next_send_at with the service role,
-- which bypasses RLS, so no additional write policy is needed for it.

-- =====================
-- Triggers
-- =====================

-- Keep updated_at fresh (reuses the function from 001_initial_schema.sql).
drop trigger if exists workspace_reminder_settings_updated_at on public.workspace_reminder_settings;
create trigger workspace_reminder_settings_updated_at
  before update on public.workspace_reminder_settings
  for each row execute function public.update_updated_at();

-- Give every new workspace a default (disabled) reminder settings row.
create or replace function public.create_workspace_reminder_settings()
returns trigger as $$
begin
  insert into public.workspace_reminder_settings (workspace_id)
  values (new.id)
  on conflict (workspace_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_workspace_created_reminder_settings on public.workspaces;
create trigger on_workspace_created_reminder_settings
  after insert on public.workspaces
  for each row execute function public.create_workspace_reminder_settings();

-- Backfill settings rows for workspaces that already exist.
insert into public.workspace_reminder_settings (workspace_id)
select id from public.workspaces
on conflict (workspace_id) do nothing;
