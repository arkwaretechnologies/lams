-- profiles extends auth.users (PRD "users" table)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null check (role in ('admin', 'staff')),
  status boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.athletes (
  id uuid primary key default gen_random_uuid(),
  student_id text not null unique,
  full_name text not null,
  rfid_tag text unique,
  status boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consumptions (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id),
  amount numeric(10,2) not null check (amount > 0),
  transaction_date date not null default (timezone('Asia/Manila', now()))::date,
  transaction_time timestamptz not null default now(),
  recorded_by uuid not null references public.profiles(id),
  client_id uuid unique,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index athletes_student_id_idx on public.athletes (student_id);
create unique index athletes_rfid_tag_idx on public.athletes (rfid_tag) where rfid_tag is not null;
create index consumptions_athlete_date_idx on public.consumptions (athlete_id, transaction_date);
create index consumptions_transaction_time_idx on public.consumptions (transaction_time desc);
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger athletes_updated_at
  before update on public.athletes
  for each row execute function public.set_updated_at();

create or replace function public.get_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'staff');
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_user_role() = 'admin';
$$;
