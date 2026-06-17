-- Consumption remarks + remark templates

alter table public.consumptions
  add column if not exists remarks text;

create table public.remark_templates (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  content text not null,
  sort_order int not null default 0,
  status boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger remark_templates_updated_at
  before update on public.remark_templates
  for each row execute function public.set_updated_at();

alter table public.remark_templates enable row level security;

create policy remark_templates_select on public.remark_templates
  for select using (
    status = true
      and public.user_has_permission('consumption')
    or public.user_has_permission('remark_templates')
  );

create policy remark_templates_insert on public.remark_templates
  for insert with check (public.user_has_permission('remark_templates'));

create policy remark_templates_update on public.remark_templates
  for update using (public.user_has_permission('remark_templates'));

create policy remark_templates_delete on public.remark_templates
  for delete using (public.user_has_permission('remark_templates'));

drop function if exists public.record_consumption(uuid, numeric, uuid, uuid);

create or replace function public.record_consumption(
  p_athlete_id uuid,
  p_amount numeric,
  p_recorded_by uuid,
  p_client_id uuid default null,
  p_remarks text default null
)
returns table(remaining_balance numeric, consumption_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_date date;
  v_consumed numeric;
  v_id uuid;
begin
  if p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;

  v_date := (timezone('Asia/Manila', now()))::date;

  if not exists (
    select 1 from public.athletes
    where id = p_athlete_id and status = true
  ) then
    raise exception 'athlete_not_found';
  end if;

  if p_client_id is not null then
    select c.id into v_id
    from public.consumptions c
    where c.client_id = p_client_id;

    if v_id is not null then
      select coalesce(sum(amount), 0) into v_consumed
      from public.consumptions
      where athlete_id = p_athlete_id and transaction_date = v_date;

      return query select (200 - v_consumed)::numeric, v_id;
      return;
    end if;
  end if;

  perform 1
  from public.consumptions
  where athlete_id = p_athlete_id and transaction_date = v_date
  for update;

  select coalesce(sum(amount), 0) into v_consumed
  from public.consumptions
  where athlete_id = p_athlete_id and transaction_date = v_date;

  if v_consumed + p_amount > 200 then
    raise exception 'insufficient_balance';
  end if;

  insert into public.consumptions (
    athlete_id,
    amount,
    transaction_date,
    transaction_time,
    recorded_by,
    client_id,
    remarks
  )
  values (
    p_athlete_id,
    p_amount,
    v_date,
    now(),
    p_recorded_by,
    p_client_id,
    nullif(trim(p_remarks), '')
  )
  returning id into v_id;

  return query select (200 - v_consumed - p_amount)::numeric, v_id;
end;
$$;

grant execute on function public.record_consumption(uuid, numeric, uuid, uuid, text) to authenticated;

insert into public.role_permissions (role_id, permission)
select r.id, 'remark_templates'
from public.roles r
where r.slug = 'administrator'
on conflict do nothing;

insert into public.remark_templates (label, content, sort_order) values
  ('Breakfast', 'Breakfast meal', 1),
  ('Lunch', 'Lunch meal', 2),
  ('Dinner', 'Dinner meal', 3),
  ('Snack', 'Snack / merienda', 4);
