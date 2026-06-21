drop view if exists public.session_ratings_public;

create view public.session_ratings_public
with (security_barrier = true)
as
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
where rated_user_id = auth.uid()
group by rated_user_id;

revoke all on public.session_ratings_public from anon, authenticated;
grant select on public.session_ratings_public to authenticated;
