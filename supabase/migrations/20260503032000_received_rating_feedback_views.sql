drop view if exists public.received_rating_feedback_recent;
drop view if exists public.received_rating_feedback_by_topic;

create view public.received_rating_feedback_by_topic
with (security_barrier = true)
as
select
  s.topic,
  round(avg(r.stars)::numeric, 2) as avg_stars,
  count(*) filter (where r.stars is not null) as rating_count,
  count(*) filter (where r.badge is not null) as badge_count,
  count(*) filter (where r.badge = 'listener') as listener_count,
  count(*) filter (where r.badge = 'calm') as calm_count,
  count(*) filter (where r.badge = 'supportive') as supportive_count,
  count(*) filter (where r.badge = 'present') as present_count,
  max(r.created_at) as last_rating_at
from public.session_ratings r
join public.sessions s on s.id = r.session_id
where r.rated_user_id = auth.uid()
group by s.topic;

create view public.received_rating_feedback_recent
with (security_barrier = true)
as
select
  r.id as feedback_id,
  s.topic,
  r.stars,
  r.badge,
  r.created_at
from public.session_ratings r
join public.sessions s on s.id = r.session_id
where r.rated_user_id = auth.uid()
  and (r.stars is not null or r.badge is not null)
order by r.created_at desc;

revoke all on public.received_rating_feedback_by_topic from anon, authenticated;
revoke all on public.received_rating_feedback_recent from anon, authenticated;

grant select on public.received_rating_feedback_by_topic to authenticated;
grant select on public.received_rating_feedback_recent to authenticated;
