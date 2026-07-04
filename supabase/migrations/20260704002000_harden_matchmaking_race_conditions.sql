with duplicate_active_sessions as (
  select
    id,
    row_number() over (
      partition by least(participant_a, participant_b), greatest(participant_a, participant_b)
      order by created_at desc, id desc
    ) as duplicate_rank
  from public.sessions
  where status = 'active'
    and participant_a is not null
    and participant_b is not null
)
update public.sessions s
set status = 'ended',
  ended_at = coalesce(s.ended_at, now())
from duplicate_active_sessions d
where s.id = d.id
  and d.duplicate_rank > 1;

create unique index if not exists sessions_one_active_pair_idx
  on public.sessions (
    least(participant_a, participant_b),
    greatest(participant_a, participant_b)
  )
  where status = 'active'
    and participant_a is not null
    and participant_b is not null;

create or replace function public.find_or_create_match(
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
  own_existing record;
  target record;
  new_session_id uuid;
  participant_a_id uuid;
  participant_b_id uuid;
  intent_a_value text;
  intent_b_value text;
  session_specific text;
begin
  if caller_id is null then
    raise exception 'Authentication is required.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(caller_id::text, 0));

  if p_topic not in ('mh', 'rel', 'career', 'night', 'advice', 'any') then
    raise exception 'Invalid topic.';
  end if;

  if p_role not in ('talker', 'listener') then
    raise exception 'Invalid role.';
  end if;

  if p_intent not in ('talk', 'listen', 'talker', 'listener', 'vent', 'advice', 'think', 'chat') then
    raise exception 'Invalid intent.';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = caller_id
      and p.safety_accepted_at is not null
  ) then
    raise exception 'Safety guidelines must be accepted before matching.';
  end if;

  if exists (
    select 1
    from public.profiles p
    where p.id = caller_id
      and p.ban_expires_at is not null
      and p.ban_expires_at > now()
  ) then
    raise exception 'You are temporarily unavailable for matching.';
  end if;

  perform 1
  from public.match_queue q
  where q.user_id = caller_id
    and q.status in ('waiting', 'matched')
  for update;

  update public.match_queue
  set status = 'expired'
  where status = 'waiting'
    and expires_at <= now();

  update public.match_queue q
  set status = 'expired',
    matched_session_id = null
  where q.user_id = caller_id
    and q.status = 'matched'
    and not exists (
      select 1
      from public.sessions s
      where s.id = q.matched_session_id
        and s.status = 'active'
        and s.created_at > now() - interval '2 minutes'
        and (s.participant_a = caller_id or s.participant_b = caller_id)
    );

  select q.*
  into own_existing
  from public.match_queue q
  join public.sessions s on s.id = q.matched_session_id
  where q.user_id = caller_id
    and q.status = 'matched'
    and q.matched_session_id is not null
    and s.status = 'active'
    and s.created_at > now() - interval '2 minutes'
    and (s.participant_a = caller_id or s.participant_b = caller_id)
    and q.topic = p_topic
    and q.role = p_role
  order by q.created_at desc
  limit 1;

  if own_existing.id is not null then
    select
      true,
      s.id,
      case
        when s.participant_a = caller_id then s.participant_b
        else s.participant_a
      end,
      case
        when s.participant_a = caller_id then s.intent_b
        else s.intent_a
      end,
      s.specific
    into matched, session_id, other_user_id, other_intent, other_specific
    from public.sessions s
    where s.id = own_existing.matched_session_id
      and s.status = 'active'
      and s.created_at > now() - interval '2 minutes'
      and (s.participant_a = caller_id or s.participant_b = caller_id);

    if session_id is not null then
      return next;
      return;
    end if;
  end if;

  select q.*
  into target
  from public.match_queue q
  join public.profiles p on p.id = q.user_id
  where q.status = 'waiting'
    and q.expires_at > now()
    and q.topic = p_topic
    and q.user_id <> caller_id
    and p.safety_accepted_at is not null
    and (
      (p_role = 'listener' and q.role = 'talker')
      or (
        p_role = 'talker'
        and (
          q.role = 'listener'
          or (p_allow_talker_fallback and q.role = 'talker')
        )
      )
    )
    and (p.ban_expires_at is null or p.ban_expires_at <= now())
  order by
    case when p_role = 'talker' and q.role = 'listener' then 0 else 1 end,
    q.created_at asc
  for update of q skip locked
  limit 1;

  if target.id is not null then
    if p_role = 'listener' then
      participant_a_id := caller_id;
      participant_b_id := target.user_id;
      intent_a_value := p_intent;
      intent_b_value := target.intent;
      session_specific := target.specific;
    elsif target.role = 'listener' then
      participant_a_id := target.user_id;
      participant_b_id := caller_id;
      intent_a_value := target.intent;
      intent_b_value := p_intent;
      session_specific := nullif(btrim(coalesce(p_specific, '')), '');
    else
      participant_a_id := caller_id;
      participant_b_id := target.user_id;
      intent_a_value := p_intent;
      intent_b_value := target.intent;
      session_specific := coalesce(nullif(btrim(coalesce(target.specific, '')), ''), nullif(btrim(coalesce(p_specific, '')), ''));
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
      session_specific,
      participant_a_id,
      participant_b_id,
      intent_a_value,
      intent_b_value
    )
    on conflict (
      (least(participant_a, participant_b)),
      (greatest(participant_a, participant_b))
    )
    where status = 'active'
      and participant_a is not null
      and participant_b is not null
    do nothing
    returning id into new_session_id;

    if new_session_id is null then
      select s.id
      into new_session_id
      from public.sessions s
      where s.status = 'active'
        and least(s.participant_a, s.participant_b) = least(participant_a_id, participant_b_id)
        and greatest(s.participant_a, s.participant_b) = greatest(participant_a_id, participant_b_id)
      order by s.created_at desc
      limit 1;
    end if;

    update public.match_queue
    set status = 'matched',
      matched_session_id = new_session_id
    where id = target.id;

    update public.match_queue
    set status = 'cancelled'
    where user_id = caller_id
      and status = 'waiting';

    insert into public.match_queue (
      user_id,
      topic,
      specific,
      intent,
      role,
      status,
      expires_at,
      matched_session_id
    )
    values (
      caller_id,
      p_topic,
      nullif(btrim(coalesce(p_specific, '')), ''),
      p_intent,
      p_role,
      'matched',
      now() + interval '2 minutes',
      new_session_id
    );

    matched := true;
    session_id := new_session_id;
    other_user_id := target.user_id;
    other_intent := target.intent;
    other_specific := session_specific;
    return next;
    return;
  end if;

  update public.match_queue
  set topic = p_topic,
    specific = nullif(btrim(coalesce(p_specific, '')), ''),
    intent = p_intent,
    role = p_role,
    expires_at = now() + interval '100 seconds',
    matched_session_id = null
  where user_id = caller_id
    and status = 'waiting';

  if not found then
    insert into public.match_queue (
      user_id,
      topic,
      specific,
      intent,
      role,
      status,
      expires_at
    )
    values (
      caller_id,
      p_topic,
      nullif(btrim(coalesce(p_specific, '')), ''),
      p_intent,
      p_role,
      'waiting',
      now() + interval '100 seconds'
    );
  end if;

  matched := false;
  session_id := null;
  other_user_id := null;
  other_intent := null;
  other_specific := null;
  return next;
end;
$$;

revoke all on function public.find_or_create_match(text, text, text, text, boolean) from public;
revoke all on function public.find_or_create_match(text, text, text, text, boolean) from anon;
grant execute on function public.find_or_create_match(text, text, text, text, boolean) to authenticated;
