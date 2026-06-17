alter table public.profiles enable row level security;
alter table public.athletes enable row level security;
alter table public.consumptions enable row level security;
alter table public.audit_logs enable row level security;

-- profiles
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy profiles_insert_admin on public.profiles
  for insert to authenticated
  with check (public.is_admin());

create policy profiles_update_admin on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy profiles_delete_admin on public.profiles
  for delete to authenticated
  using (public.is_admin());

-- athletes
create policy athletes_select on public.athletes
  for select to authenticated
  using (
    public.is_admin()
    or (status = true and public.get_user_role() = 'staff')
  );

create policy athletes_insert_admin on public.athletes
  for insert to authenticated
  with check (public.is_admin());

create policy athletes_update_admin on public.athletes
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy athletes_delete_admin on public.athletes
  for delete to authenticated
  using (public.is_admin());

-- consumptions (read only from client; writes via RPC)
create policy consumptions_select on public.consumptions
  for select to authenticated
  using (true);

-- audit_logs
create policy audit_logs_select_admin on public.audit_logs
  for select to authenticated
  using (public.is_admin());

create policy audit_logs_insert on public.audit_logs
  for insert to authenticated
  with check (user_id = auth.uid() or public.is_admin());
