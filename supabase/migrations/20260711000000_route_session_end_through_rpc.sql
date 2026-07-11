create or replace function public.end_session(
  p_session_id uuid,
  p_duration_seconds integer default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := auth.uid();
  session_status text;
begin
  if caller_id is null then
    raise exception 'Authentication is required.';
  end if;

  if p_duration_seconds is not null and (p_duration_seconds < 0 or p_duration_seconds > 7200) then
    raise exception 'Invalid duration: must be between 0 and 7200 seconds';
  end if;

  select s.status
  into session_status
  from public.sessions s
  where s.id = p_session_id
    and (
      s.participant_a = caller_id
      or s.participant_b = caller_id
      or s.user1_id = caller_id
      or s.user2_id = caller_id
    );

  if session_status is null then
    raise exception 'Session not found or not a participant';
  end if;

  if session_status <> 'active' then
    return;
  end if;

  update public.sessions
  set status = 'ended',
    ended_at = coalesce(ended_at, now())
  where id = p_session_id
    and status = 'active';
end;
$$;

revoke update on public.sessions from authenticated;

revoke all on function public.end_session(uuid, integer) from public;
revoke all on function public.end_session(uuid, integer) from anon;
grant execute on function public.end_session(uuid, integer) to authenticated;
