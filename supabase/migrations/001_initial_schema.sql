-- =====================
-- 1. Create all tables
-- =====================

-- Workspaces
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  email text not null,
  full_name text not null default '',
  created_at timestamptz default now()
);

-- Subscriptions
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  software_name text not null,
  price numeric(10, 2) not null,
  currency text not null default 'USD',
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'yearly')),
  seats integer not null default 1,
  next_renewal_date date not null,
  status text not null default 'active' check (status in ('active', 'cancelled')),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Notification log
create table public.notification_log (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.subscriptions(id) on delete cascade not null,
  notification_type text not null check (notification_type in ('30_day', '14_day', '7_day')),
  sent_at timestamptz default now()
);

-- Workspace invites
create table public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  email text not null,
  invited_by uuid references public.profiles(id) not null,
  accepted boolean default false,
  created_at timestamptz default now()
);

-- =====================
-- 2. Enable RLS on all tables
-- =====================

alter table public.workspaces enable row level security;
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.notification_log enable row level security;
alter table public.workspace_invites enable row level security;

-- =====================
-- 3. Helper function to get workspace_id without triggering RLS
-- =====================

create or replace function public.get_user_workspace_id()
returns uuid as $$
  select workspace_id from public.profiles where id = auth.uid()
$$ language sql security definer stable;

-- =====================
-- 4. RLS Policies
-- =====================

-- Workspaces
create policy "Users can view their own workspace"
  on public.workspaces for select
  using (id = public.get_user_workspace_id());

create policy "Admins can update their own workspace"
  on public.workspaces for update
  using (
    id = public.get_user_workspace_id()
    and exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Profiles: own profile OR same workspace
create policy "Users can view profiles in their workspace"
  on public.profiles for select
  using (
    id = auth.uid()
    or workspace_id = public.get_user_workspace_id()
  );

create policy "Admins can update profiles in their workspace"
  on public.profiles for update
  using (
    workspace_id = public.get_user_workspace_id()
    and exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Subscriptions
create policy "Users can view subscriptions in their workspace"
  on public.subscriptions for select
  using (workspace_id = public.get_user_workspace_id());

create policy "Admins can insert subscriptions"
  on public.subscriptions for insert
  with check (
    workspace_id = public.get_user_workspace_id()
    and exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update subscriptions"
  on public.subscriptions for update
  using (
    workspace_id = public.get_user_workspace_id()
    and exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete subscriptions"
  on public.subscriptions for delete
  using (
    workspace_id = public.get_user_workspace_id()
    and exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Notification log
create policy "Users can view notification logs in their workspace"
  on public.notification_log for select
  using (
    subscription_id in (
      select id from public.subscriptions where workspace_id = public.get_user_workspace_id()
    )
  );

-- Workspace invites
create policy "Users can view invites in their workspace"
  on public.workspace_invites for select
  using (workspace_id = public.get_user_workspace_id());

create policy "Admins can create invites"
  on public.workspace_invites for insert
  with check (
    workspace_id = public.get_user_workspace_id()
    and exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

-- =====================
-- 5. Functions & Triggers
-- =====================

-- Handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  invite_record record;
  ws_id uuid;
begin
  -- Check if user was invited
  select * into invite_record from public.workspace_invites
    where email = new.email and accepted = false
    limit 1;

  if invite_record is not null then
    -- Join existing workspace as member
    insert into public.profiles (id, workspace_id, role, email, full_name)
    values (new.id, invite_record.workspace_id, 'member', new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));

    update public.workspace_invites set accepted = true where id = invite_record.id;
  else
    -- Create new workspace
    insert into public.workspaces (name) values (coalesce(new.raw_user_meta_data->>'company_name', 'My Workspace'))
    returning id into ws_id;

    insert into public.profiles (id, workspace_id, role, email, full_name)
    values (new.id, ws_id, 'admin', new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users insert
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger for subscriptions
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.update_updated_at();
