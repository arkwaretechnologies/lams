-- Dynamic roles RBAC migration

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission text not null,
  primary key (role_id, permission)
);

insert into public.roles (name, slug, description, is_system) values
  ('Administrator', 'administrator', 'Full system access', true),
  ('Cashier', 'cashier', 'Consumption and daily operations', false);

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join (
  values
    ('dashboard'),
    ('consumption'),
    ('athletes'),
    ('athletes_import'),
    ('rfid'),
    ('transactions'),
    ('reports'),
    ('users'),
    ('roles')
) as p(permission)
where r.slug = 'administrator';

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join (
  values
    ('dashboard'),
    ('consumption'),
    ('transactions')
) as p(permission)
where r.slug = 'cashier';

alter table public.profiles add column role_id uuid references public.roles(id);

update public.profiles
set role_id = (select id from public.roles where slug = 'administrator')
where role = 'admin';

update public.profiles
set role_id = (select id from public.roles where slug = 'cashier')
where role = 'staff';

update public.profiles
set role_id = (select id from public.roles where slug = 'administrator')
where role_id is null;

alter table public.profiles alter column role_id set not null;
alter table public.profiles drop column role;

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_admin on public.profiles;
drop policy if exists profiles_update_admin on public.profiles;
drop policy if exists profiles_delete_admin on public.profiles;
drop policy if exists athletes_select on public.athletes;
drop policy if exists athletes_insert_admin on public.athletes;
drop policy if exists athletes_update_admin on public.athletes;
drop policy if exists athletes_delete_admin on public.athletes;
drop policy if exists consumptions_select on public.consumptions;
drop policy if exists audit_logs_select_admin on public.audit_logs;
drop policy if exists audit_logs_insert on public.audit_logs;

drop function if exists public.is_admin();
drop function if exists public.get_user_role();

create or replace function public.is_administrator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role_slug', '') = 'administrator';
$$;

create or replace function public.user_has_permission(p_permission text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_administrator()
    or exists (
      select 1
      from jsonb_array_elements_text(
        coalesce(auth.jwt() -> 'app_metadata' -> 'permissions', '[]'::jsonb)
      ) as elem
      where elem = p_permission
    );
$$;

alter table public.roles enable row level security;
alter table public.role_permissions enable row level security;

create policy roles_select on public.roles
  for select to authenticated
  using (public.user_has_permission('roles') or public.user_has_permission('users'));

create policy roles_insert on public.roles
  for insert to authenticated
  with check (public.user_has_permission('roles'));

create policy roles_update on public.roles
  for update to authenticated
  using (public.user_has_permission('roles'))
  with check (public.user_has_permission('roles'));

create policy roles_delete on public.roles
  for delete to authenticated
  using (public.user_has_permission('roles'));

create policy role_permissions_select on public.role_permissions
  for select to authenticated
  using (public.user_has_permission('roles') or public.user_has_permission('users'));

create policy role_permissions_insert on public.role_permissions
  for insert to authenticated
  with check (public.user_has_permission('roles'));

create policy role_permissions_update on public.role_permissions
  for update to authenticated
  using (public.user_has_permission('roles'))
  with check (public.user_has_permission('roles'));

create policy role_permissions_delete on public.role_permissions
  for delete to authenticated
  using (public.user_has_permission('roles'));

create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.user_has_permission('users'));

create policy profiles_insert_users on public.profiles
  for insert to authenticated
  with check (public.user_has_permission('users'));

create policy profiles_update_users on public.profiles
  for update to authenticated
  using (public.user_has_permission('users'))
  with check (public.user_has_permission('users'));

create policy profiles_delete_users on public.profiles
  for delete to authenticated
  using (public.user_has_permission('users'));

create policy athletes_select on public.athletes
  for select to authenticated
  using (
    public.user_has_permission('athletes')
    or (status = true and public.user_has_permission('consumption'))
  );

create policy athletes_insert on public.athletes
  for insert to authenticated
  with check (public.user_has_permission('athletes'));

create policy athletes_update on public.athletes
  for update to authenticated
  using (public.user_has_permission('athletes'))
  with check (public.user_has_permission('athletes'));

create policy athletes_delete on public.athletes
  for delete to authenticated
  using (public.user_has_permission('athletes'));

create policy consumptions_select on public.consumptions
  for select to authenticated
  using (true);

create policy audit_logs_select on public.audit_logs
  for select to authenticated
  using (public.is_administrator() or public.user_has_permission('users'));

create policy audit_logs_insert on public.audit_logs
  for insert to authenticated
  with check (user_id = auth.uid() or public.user_has_permission('users'));
