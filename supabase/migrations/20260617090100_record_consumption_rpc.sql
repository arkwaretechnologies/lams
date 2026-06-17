create or replace view public.athlete_daily_balance
with (security_invoker = true) as
select
  a.id as athlete_id,
  a.student_id,
  a.full_name,
  a.rfid_tag,
  a.status,
  200::numeric as daily_allowance,
  coalesce(daily.consumed, 0) as consumed_today,
  200::numeric - coalesce(daily.consumed, 0) as remaining_today
from public.athletes a
left join lateral (
  select sum(c.amount) as consumed
  from public.consumptions c
  where c.athlete_id = a.id
    and c.transaction_date = (timezone('Asia/Manila', now()))::date
) daily on true;

create or replace function public.record_consumption(
  p_athlete_id uuid,
  p_amount numeric,
  p_recorded_by uuid,
  p_client_id uuid default null
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
    athlete_id, amount, transaction_date, transaction_time, recorded_by, client_id
  )
  values (p_athlete_id, p_amount, v_date, now(), p_recorded_by, p_client_id)
  returning id into v_id;

  return query select (200 - v_consumed - p_amount)::numeric, v_id;
end;
$$;

grant execute on function public.record_consumption(uuid, numeric, uuid, uuid) to authenticated;
