-- Enable realtime for workspaces table so members see name updates live.
-- Wrapped to stay idempotent if the table is already in the publication.
do $$
begin
  alter publication supabase_realtime add table public.workspaces;
exception
  when duplicate_object then null;
end $$;

-- Ensure UPDATE payloads include the full new row (not just the primary key
-- and changed column) so subscribers can reliably read fields like `name`.
alter table public.workspaces replica identity full;
