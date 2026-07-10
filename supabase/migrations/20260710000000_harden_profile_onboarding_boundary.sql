create or replace function public.ensure_own_profile()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := auth.uid();
begin
  if caller_id is null then
    raise exception 'Authentication is required.';
  end if;

  insert into public.profiles (id)
  values (caller_id)
  on conflict (id) do nothing;

  return caller_id;
end;
$$;

create or replace function public.accept_safety_guidelines()
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := auth.uid();
  accepted_at timestamptz := now();
begin
  if caller_id is null then
    raise exception 'Authentication is required.';
  end if;

  insert into public.profiles (id, safety_accepted_at)
  values (caller_id, accepted_at)
  on conflict (id) do update
  set safety_accepted_at = excluded.safety_accepted_at;

  return accepted_at;
end;
$$;

revoke insert on public.profiles from authenticated;
revoke update (safety_accepted_at) on public.profiles from authenticated;

revoke all on function public.ensure_own_profile() from public;
revoke all on function public.ensure_own_profile() from anon;
grant execute on function public.ensure_own_profile() to authenticated;

revoke all on function public.accept_safety_guidelines() from public;
revoke all on function public.accept_safety_guidelines() from anon;
grant execute on function public.accept_safety_guidelines() to authenticated;
