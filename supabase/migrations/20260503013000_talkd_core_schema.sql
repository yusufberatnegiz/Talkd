create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text null,
  display_name text null,
  report_count integer not null default 0,
  ban_expires_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_report_count_nonnegative check (report_count >= 0)
);

alter table public.profiles add column if not exists username text null;
alter table public.profiles add column if not exists display_name text null;
alter table public.profiles add column if not exists report_count integer not null default 0;
alter table public.profiles add column if not exists ban_expires_at timestamptz null;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_report_count_nonnegative'
  ) then
    alter table public.profiles
      add constraint profiles_report_count_nonnegative check (report_count >= 0);
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  specific text null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  ended_at timestamptz null,
  participant_a uuid references public.profiles(id) on delete set null,
  participant_b uuid references public.profiles(id) on delete set null,
  intent_a text null,
  intent_b text null,
  duration_seconds integer generated always as (
    case
      when ended_at is null then 0
      else greatest(0, floor(extract(epoch from (ended_at - created_at)))::integer)
    end
  ) stored,
  constraint sessions_distinct_participants check (
    participant_a is null or participant_b is null or participant_a <> participant_b
  ),
  constraint sessions_status_valid check (status in ('active', 'ended', 'cancelled'))
);

alter table public.sessions add column if not exists topic text;
alter table public.sessions add column if not exists specific text null;
alter table public.sessions add column if not exists status text not null default 'active';
alter table public.sessions add column if not exists created_at timestamptz not null default now();
alter table public.sessions add column if not exists ended_at timestamptz null;
alter table public.sessions add column if not exists participant_a uuid references public.profiles(id) on delete set null;
alter table public.sessions add column if not exists participant_b uuid references public.profiles(id) on delete set null;
alter table public.sessions add column if not exists intent_a text null;
alter table public.sessions add column if not exists intent_b text null;

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'sessions'
      and column_name = 'duration_seconds'
  ) then
    alter table public.sessions add column duration_seconds integer generated always as (
      case
        when ended_at is null then 0
        else greatest(0, floor(extract(epoch from (ended_at - created_at)))::integer)
      end
    ) stored;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'sessions_distinct_participants'
  ) then
    alter table public.sessions
      add constraint sessions_distinct_participants check (
        participant_a is null or participant_b is null or participant_a <> participant_b
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'sessions_status_valid'
  ) then
    alter table public.sessions
      add constraint sessions_status_valid check (status in ('active', 'ended', 'cancelled'));
  end if;
end $$;

create index if not exists sessions_participant_a_idx on public.sessions(participant_a);
create index if not exists sessions_participant_b_idx on public.sessions(participant_b);
create index if not exists sessions_topic_status_created_at_idx on public.sessions(topic, status, created_at desc);

create table if not exists public.match_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  topic text not null,
  specific text null,
  intent text not null,
  role text null,
  status text not null default 'waiting',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '60 seconds'),
  matched_session_id uuid null references public.sessions(id) on delete set null,
  constraint match_queue_intent_valid check (
    intent in ('talk', 'listen', 'talker', 'listener', 'vent', 'advice', 'think', 'chat')
  ),
  constraint match_queue_role_valid check (
    role is null or role in ('talker', 'listener')
  ),
  constraint match_queue_status_valid check (status in ('waiting', 'matched', 'cancelled', 'expired'))
);

alter table public.match_queue add column if not exists user_id uuid references public.profiles(id) on delete cascade;
alter table public.match_queue add column if not exists topic text;
alter table public.match_queue add column if not exists specific text null;
alter table public.match_queue add column if not exists intent text;
alter table public.match_queue add column if not exists role text null;
alter table public.match_queue add column if not exists status text not null default 'waiting';
alter table public.match_queue add column if not exists created_at timestamptz not null default now();
alter table public.match_queue add column if not exists expires_at timestamptz not null default (now() + interval '60 seconds');
alter table public.match_queue add column if not exists matched_session_id uuid references public.sessions(id) on delete set null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'match_queue_intent_valid'
  ) then
    alter table public.match_queue
      add constraint match_queue_intent_valid check (
        intent in ('talk', 'listen', 'talker', 'listener', 'vent', 'advice', 'think', 'chat')
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'match_queue_role_valid'
  ) then
    alter table public.match_queue
      add constraint match_queue_role_valid check (role is null or role in ('talker', 'listener'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'match_queue_status_valid'
  ) then
    alter table public.match_queue
      add constraint match_queue_status_valid check (status in ('waiting', 'matched', 'cancelled', 'expired'));
  end if;
end $$;

create unique index if not exists match_queue_one_waiting_row_per_user_idx
  on public.match_queue(user_id)
  where status = 'waiting';
create index if not exists match_queue_topic_status_created_at_idx
  on public.match_queue(topic, status, created_at);
create index if not exists match_queue_expires_at_idx on public.match_queue(expires_at);

create table if not exists public.session_ratings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions(id) on delete cascade,
  rater_id uuid references public.profiles(id) on delete set null,
  rated_user_id uuid references public.profiles(id) on delete set null,
  stars integer null check (stars between 1 and 5),
  badge text null,
  private_note text null,
  created_at timestamptz not null default now()
);

alter table public.session_ratings add column if not exists session_id uuid references public.sessions(id) on delete cascade;
alter table public.session_ratings add column if not exists rater_id uuid references public.profiles(id) on delete set null;
alter table public.session_ratings add column if not exists rated_user_id uuid references public.profiles(id) on delete set null;
alter table public.session_ratings add column if not exists stars integer null;
alter table public.session_ratings add column if not exists badge text null;
alter table public.session_ratings add column if not exists private_note text null;
alter table public.session_ratings add column if not exists created_at timestamptz not null default now();

alter table public.session_ratings alter column stars drop not null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'session_ratings'
      and column_name = 'topic'
  ) then
    alter table public.session_ratings alter column topic drop not null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'session_ratings'
      and column_name = 'duration_minutes'
  ) then
    alter table public.session_ratings alter column duration_minutes drop not null;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'session_ratings_stars_check'
  ) then
    alter table public.session_ratings
      add constraint session_ratings_stars_check check (stars between 1 and 5);
  end if;
end $$;

create unique index if not exists session_ratings_one_per_rater_session_idx
  on public.session_ratings(session_id, rater_id)
  where session_id is not null and rater_id is not null;
create index if not exists session_ratings_rated_user_id_idx on public.session_ratings(rated_user_id);
create index if not exists session_ratings_session_id_idx on public.session_ratings(session_id);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions(id) on delete set null,
  reporter_id uuid references public.profiles(id) on delete set null,
  reported_user_id uuid references public.profiles(id) on delete set null,
  reason text not null,
  details text null,
  created_at timestamptz not null default now()
);

alter table public.reports add column if not exists session_id uuid references public.sessions(id) on delete set null;
alter table public.reports add column if not exists reporter_id uuid references public.profiles(id) on delete set null;
alter table public.reports add column if not exists reported_user_id uuid references public.profiles(id) on delete set null;
alter table public.reports add column if not exists reason text;
alter table public.reports add column if not exists details text null;
alter table public.reports add column if not exists created_at timestamptz not null default now();

create unique index if not exists reports_one_per_reporter_session_idx
  on public.reports(session_id, reporter_id)
  where session_id is not null and reporter_id is not null;
create index if not exists reports_session_id_idx on public.reports(session_id);
create index if not exists reports_reporter_id_idx on public.reports(reporter_id);
create index if not exists reports_reported_user_id_idx on public.reports(reported_user_id);

create or replace function public.is_session_participant(input_session_id uuid, input_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.sessions s
    where s.id = input_session_id
      and input_user_id is not null
      and (s.participant_a = input_user_id or s.participant_b = input_user_id)
  );
$$;

create or replace view public.session_ratings_public as
select
  rated_user_id,
  round(avg(stars)::numeric, 2) as avg_stars,
  count(*) filter (where stars is not null) as rating_count,
  count(*) filter (where badge is not null) as badge_count,
  count(*) filter (where badge in ('listener', 'supportive', 'present')) as helpful_count,
  count(*) filter (where badge in ('calm', 'supportive', 'present')) as kind_count,
  count(*) filter (where badge = 'listener') as listener_count,
  count(*) filter (where badge = 'calm') as calm_count,
  count(*) filter (where badge = 'supportive') as supportive_count,
  count(*) filter (where badge = 'present') as present_count
from public.session_ratings
where rated_user_id is not null
group by rated_user_id;

alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.match_queue enable row level security;
alter table public.session_ratings enable row level security;
alter table public.reports enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists profiles_update_own_allowed_fields on public.profiles;
create policy profiles_update_own_allowed_fields
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists sessions_select_participants on public.sessions;
create policy sessions_select_participants
on public.sessions for select
to authenticated
using (public.is_session_participant(id, auth.uid()));

drop policy if exists sessions_insert_participant on public.sessions;
create policy sessions_insert_participant
on public.sessions for insert
to authenticated
with check (
  participant_a is not null
  and participant_b is not null
  and participant_a <> participant_b
  and (participant_a = auth.uid() or participant_b = auth.uid())
);

drop policy if exists sessions_update_participants on public.sessions;
create policy sessions_update_participants
on public.sessions for update
to authenticated
using (public.is_session_participant(id, auth.uid()))
with check (public.is_session_participant(id, auth.uid()));

drop policy if exists match_queue_select_own on public.match_queue;
create policy match_queue_select_own
on public.match_queue for select
to authenticated
using (user_id = auth.uid());

drop policy if exists match_queue_insert_own on public.match_queue;
create policy match_queue_insert_own
on public.match_queue for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists match_queue_update_own on public.match_queue;
create policy match_queue_update_own
on public.match_queue for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists match_queue_delete_own on public.match_queue;
create policy match_queue_delete_own
on public.match_queue for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists session_ratings_select_own on public.session_ratings;
create policy session_ratings_select_own
on public.session_ratings for select
to authenticated
using (rater_id = auth.uid());

drop policy if exists session_ratings_insert_participant on public.session_ratings;
create policy session_ratings_insert_participant
on public.session_ratings for insert
to authenticated
with check (
  rater_id = auth.uid()
  and rated_user_id is not null
  and rated_user_id <> auth.uid()
  and public.is_session_participant(session_id, auth.uid())
  and public.is_session_participant(session_id, rated_user_id)
);

drop policy if exists reports_select_own on public.reports;
create policy reports_select_own
on public.reports for select
to authenticated
using (reporter_id = auth.uid());

drop policy if exists reports_insert_participant on public.reports;
create policy reports_insert_participant
on public.reports for insert
to authenticated
with check (
  reporter_id = auth.uid()
  and reported_user_id is not null
  and reported_user_id <> auth.uid()
  and public.is_session_participant(session_id, auth.uid())
  and public.is_session_participant(session_id, reported_user_id)
);

revoke all on public.profiles from anon, authenticated;
revoke all on public.sessions from anon, authenticated;
revoke all on public.match_queue from anon, authenticated;
revoke all on public.session_ratings from anon, authenticated;
revoke all on public.reports from anon, authenticated;

grant select on public.session_ratings_public to anon, authenticated;
grant select on public.profiles to authenticated;
grant insert (id, username, display_name) on public.profiles to authenticated;
grant update (username, display_name, updated_at) on public.profiles to authenticated;

grant select, insert on public.sessions to authenticated;
grant update (status, ended_at) on public.sessions to authenticated;

grant select, insert, update, delete on public.match_queue to authenticated;
grant select, insert on public.session_ratings to authenticated;
grant select, insert on public.reports to authenticated;
grant execute on function public.is_session_participant(uuid, uuid) to authenticated;
