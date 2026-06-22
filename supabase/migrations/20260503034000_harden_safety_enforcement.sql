revoke insert on public.sessions from authenticated;

revoke all on function public.create_matched_session(text, text, uuid, uuid, text, text) from public;
revoke all on function public.create_matched_session(text, text, uuid, uuid, text, text) from anon;
revoke all on function public.create_matched_session(text, text, uuid, uuid, text, text) from authenticated;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'session_ratings_badge_valid'
  ) then
    alter table public.session_ratings
      add constraint session_ratings_badge_valid
      check (
        badge is null
        or badge in (
          'listener',
          'calm',
          'supportive',
          'present',
          'unresponsive',
          'dismissive',
          'unhelpful',
          'disconnected'
        )
      )
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'reports_reason_valid'
  ) then
    alter table public.reports
      add constraint reports_reason_valid
      check (
        reason in (
          'harassment_or_abuse',
          'sexual_content',
          'hate_or_discrimination',
          'self_harm_encouragement',
          'spam_or_selling',
          'something_else'
        )
      )
      not valid;
  end if;
end $$;

create or replace function public.apply_report_safety_action()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.reported_user_id is null then
    return new;
  end if;

  update public.profiles
  set
    report_count = report_count + 1,
    ban_expires_at = case
      when report_count + 1 >= 3 then greatest(
        coalesce(ban_expires_at, '-infinity'::timestamptz),
        now() + interval '24 hours'
      )
      else ban_expires_at
    end
  where id = new.reported_user_id;

  return new;
end;
$$;

drop trigger if exists reports_apply_safety_action on public.reports;
create trigger reports_apply_safety_action
after insert on public.reports
for each row execute function public.apply_report_safety_action();

revoke all on function public.apply_report_safety_action() from public;
revoke all on function public.apply_report_safety_action() from anon;
revoke all on function public.apply_report_safety_action() from authenticated;
