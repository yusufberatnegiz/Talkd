create or replace function public.submit_session_rating(
  p_session_id uuid,
  p_stars integer default null,
  p_badge text default null,
  p_private_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := auth.uid();
  rated_id uuid;
  rating_id uuid;
  clean_badge text := nullif(btrim(coalesce(p_badge, '')), '');
  clean_note text := nullif(btrim(coalesce(p_private_note, '')), '');
begin
  if caller_id is null then
    raise exception 'Authentication is required.';
  end if;

  if p_stars is not null and (p_stars < 1 or p_stars > 5) then
    raise exception 'Invalid rating.';
  end if;

  if clean_badge is not null and clean_badge not in (
    'listener',
    'calm',
    'supportive',
    'present',
    'unresponsive',
    'dismissive',
    'unhelpful',
    'disconnected'
  ) then
    raise exception 'Invalid rating badge.';
  end if;

  select case
    when s.participant_a = caller_id then s.participant_b
    when s.participant_b = caller_id then s.participant_a
    else null
  end
  into rated_id
  from public.sessions s
  where s.id = p_session_id
    and s.status in ('active', 'ended');

  if rated_id is null then
    raise exception 'Session is not available for rating.';
  end if;

  insert into public.session_ratings (
    session_id,
    rater_id,
    rated_user_id,
    stars,
    badge,
    private_note
  )
  values (
    p_session_id,
    caller_id,
    rated_id,
    p_stars,
    clean_badge,
    clean_note
  )
  on conflict (session_id, rater_id)
  where session_id is not null and rater_id is not null
  do update
  set stars = excluded.stars,
    badge = excluded.badge,
    private_note = excluded.private_note
  returning id into rating_id;

  return rating_id;
end;
$$;

create or replace function public.submit_session_report(
  p_session_id uuid,
  p_reason text,
  p_details text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := auth.uid();
  reported_id uuid;
  report_id uuid;
  clean_reason text := nullif(btrim(coalesce(p_reason, '')), '');
  clean_details text := nullif(btrim(coalesce(p_details, '')), '');
begin
  if caller_id is null then
    raise exception 'Authentication is required.';
  end if;

  if clean_reason is null or clean_reason not in (
    'harassment_or_abuse',
    'sexual_content',
    'hate_or_discrimination',
    'self_harm_encouragement',
    'spam_or_selling',
    'something_else'
  ) then
    raise exception 'Invalid report reason.';
  end if;

  select case
    when s.participant_a = caller_id then s.participant_b
    when s.participant_b = caller_id then s.participant_a
    else null
  end
  into reported_id
  from public.sessions s
  where s.id = p_session_id
    and s.status in ('active', 'ended');

  if reported_id is null then
    raise exception 'Session is not available for reporting.';
  end if;

  insert into public.reports (
    session_id,
    reporter_id,
    reported_user_id,
    reason,
    details
  )
  values (
    p_session_id,
    caller_id,
    reported_id,
    clean_reason,
    clean_details
  )
  on conflict (session_id, reporter_id)
  where session_id is not null and reporter_id is not null
  do update
  set reason = excluded.reason,
    details = excluded.details
  returning id into report_id;

  return report_id;
end;
$$;

revoke insert on public.session_ratings from authenticated;
revoke insert on public.reports from authenticated;

revoke all on function public.submit_session_rating(uuid, integer, text, text) from public;
revoke all on function public.submit_session_rating(uuid, integer, text, text) from anon;
grant execute on function public.submit_session_rating(uuid, integer, text, text) to authenticated;

revoke all on function public.submit_session_report(uuid, text, text) from public;
revoke all on function public.submit_session_report(uuid, text, text) from anon;
grant execute on function public.submit_session_report(uuid, text, text) to authenticated;
