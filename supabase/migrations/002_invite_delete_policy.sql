-- Allow admins to delete (revoke) pending invites from their workspace
create policy "Admins can delete invites"
  on public.workspace_invites for delete
  using (
    workspace_id = public.get_user_workspace_id()
    and exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );
