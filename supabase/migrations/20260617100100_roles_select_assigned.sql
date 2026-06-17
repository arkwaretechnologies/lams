create policy roles_select_assigned on public.roles
  for select to authenticated
  using (id in (select role_id from public.profiles where id = auth.uid()));
