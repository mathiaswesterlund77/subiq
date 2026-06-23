-- Add is_active column to profiles (default true for all existing members)
alter table public.profiles
  add column if not exists is_active boolean not null default true;

-- Allow admins to update member status within their workspace
create policy "Admins can update member status"
  on public.profiles for update
  using (
    workspace_id = public.get_user_workspace_id()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    workspace_id = public.get_user_workspace_id()
  );
