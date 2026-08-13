create table if not exists public.premium_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  product_id text not null check (product_id in ('talkd_premium_monthly', 'talkd_premium_yearly')),
  original_transaction_id text not null unique,
  latest_transaction_id text not null unique,
  environment text not null check (environment in ('Production', 'Sandbox')),
  expires_at timestamptz not null,
  revoked_at timestamptz null,
  verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.premium_entitlements enable row level security;

revoke all on table public.premium_entitlements from anon, authenticated;
grant all on table public.premium_entitlements to service_role;

create or replace function public.has_active_premium(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.premium_entitlements pe
    where pe.user_id = p_user_id
      and pe.revoked_at is null
      and pe.expires_at > now()
  );
$$;

revoke all on function public.has_active_premium(uuid) from public, anon, authenticated;

create or replace function public.get_premium_status()
returns table (
  active boolean,
  product_id text,
  expires_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    public.has_active_premium(auth.uid()) as active,
    pe.product_id,
    pe.expires_at
  from (select auth.uid() as user_id) caller
  left join public.premium_entitlements pe on pe.user_id = caller.user_id
  where caller.user_id is not null;
$$;

revoke all on function public.get_premium_status() from public, anon;
grant execute on function public.get_premium_status() to authenticated;

alter function public.find_or_create_match(text, text, text, text, boolean, boolean, boolean)
  rename to find_or_create_match_internal;

revoke all on function public.find_or_create_match_internal(text, text, text, text, boolean, boolean, boolean)
  from public, anon, authenticated;

create or replace function public.find_or_create_match(
  p_topic text,
  p_specific text,
  p_intent text,
  p_role text,
  p_allow_talker_fallback boolean default false,
  p_priority_listener_preference boolean default false,
  p_skip_listen_back_gate boolean default false
)
returns table (
  matched boolean,
  session_id uuid,
  other_user_id uuid,
  other_intent text,
  other_specific text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := auth.uid();
  caller_is_premium boolean;
begin
  if caller_id is null then
    raise exception 'Authentication is required.';
  end if;

  caller_is_premium := public.has_active_premium(caller_id);

  return query
  select result.*
  from public.find_or_create_match_internal(
    p_topic,
    p_specific,
    p_intent,
    p_role,
    p_allow_talker_fallback,
    caller_is_premium,
    caller_is_premium
  ) result;
end;
$$;

revoke all on function public.find_or_create_match(text, text, text, text, boolean, boolean, boolean)
  from public, anon;
grant execute on function public.find_or_create_match(text, text, text, text, boolean, boolean, boolean)
  to authenticated;

create or replace function public.find_or_create_match_secure(
  p_topic text,
  p_specific text,
  p_intent text,
  p_role text,
  p_allow_talker_fallback boolean default false
)
returns table (
  matched boolean,
  session_id uuid,
  other_user_id uuid,
  other_intent text,
  other_specific text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := auth.uid();
  caller_is_premium boolean;
begin
  if caller_id is null then
    raise exception 'Authentication is required.';
  end if;

  caller_is_premium := public.has_active_premium(caller_id);

  return query
  select result.*
  from public.find_or_create_match_internal(
    p_topic,
    p_specific,
    p_intent,
    p_role,
    p_allow_talker_fallback,
    caller_is_premium,
    caller_is_premium
  ) result;
end;
$$;

revoke all on function public.find_or_create_match_secure(text, text, text, text, boolean)
  from public, anon;
grant execute on function public.find_or_create_match_secure(text, text, text, text, boolean)
  to authenticated;
