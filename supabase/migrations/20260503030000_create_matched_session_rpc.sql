create or replace function public.create_matched_session(
  p_topic text,
  p_specific text,
  p_participant_a uuid,
  p_participant_b uuid,
  p_intent_a text,
  p_intent_b text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := auth.uid();
  new_session_id uuid;
begin
  if caller_id is null then
    raise exception 'Authentication is required.';
  end if;

  if p_participant_a is null or p_participant_b is null then
    raise exception 'Both participants are required.';
  end if;

  if p_participant_a = p_participant_b then
    raise exception 'Cannot create a session with the same participant twice.';
  end if;

  if caller_id <> p_participant_a and caller_id <> p_participant_b then
    raise exception 'Caller must be a session participant.';
  end if;

  if p_topic not in ('mh', 'rel', 'career', 'night', 'advice', 'any') then
    raise exception 'Invalid topic.';
  end if;

  if exists (
    select 1
    from public.profiles p
    where p.id in (p_participant_a, p_participant_b)
      and p.ban_expires_at is not null
      and p.ban_expires_at > now()
  ) then
    raise exception 'A participant is currently unavailable for matching.';
  end if;

  insert into public.sessions (
    topic,
    specific,
    participant_a,
    participant_b,
    intent_a,
    intent_b
  )
  values (
    p_topic,
    nullif(btrim(coalesce(p_specific, '')), ''),
    p_participant_a,
    p_participant_b,
    nullif(btrim(coalesce(p_intent_a, '')), ''),
    nullif(btrim(coalesce(p_intent_b, '')), '')
  )
  returning id into new_session_id;

  return new_session_id;
end;
$$;

revoke all on function public.create_matched_session(text, text, uuid, uuid, text, text) from public;
grant execute on function public.create_matched_session(text, text, uuid, uuid, text, text) to authenticated;
