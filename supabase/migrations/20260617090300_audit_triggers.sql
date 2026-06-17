create or replace function public.log_audit(
  p_action text,
  p_entity_type text,
  p_entity_id uuid default null,
  p_metadata jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (user_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, p_metadata);
end;
$$;

create or replace function public.audit_athletes_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.log_audit('create', 'athlete', new.id, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform public.log_audit('update', 'athlete', new.id, jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new)));
  elsif tg_op = 'DELETE' then
    perform public.log_audit('delete', 'athlete', old.id, to_jsonb(old));
  end if;
  return coalesce(new, old);
end;
$$;

create trigger athletes_audit
  after insert or update or delete on public.athletes
  for each row execute function public.audit_athletes_changes();

create or replace function public.audit_profiles_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.log_audit('create', 'profile', new.id, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform public.log_audit('update', 'profile', new.id, jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new)));
  elsif tg_op = 'DELETE' then
    perform public.log_audit('delete', 'profile', old.id, to_jsonb(old));
  end if;
  return coalesce(new, old);
end;
$$;

create trigger profiles_audit
  after insert or update or delete on public.profiles
  for each row execute function public.audit_profiles_changes();
