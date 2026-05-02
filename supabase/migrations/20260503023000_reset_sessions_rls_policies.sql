alter table public.sessions enable row level security;

do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'sessions'
  loop
    execute format('drop policy if exists %I on public.sessions', existing_policy.policyname);
  end loop;
end $$;

create policy sessions_select_participants
on public.sessions for select
to authenticated
using (
  participant_a = auth.uid()
  or participant_b = auth.uid()
);

create policy sessions_insert_participant
on public.sessions for insert
to authenticated
with check (
  auth.uid() is not null
  and participant_a is not null
  and participant_b is not null
  and participant_a <> participant_b
  and (
    participant_a = auth.uid()
    or participant_b = auth.uid()
  )
);

create policy sessions_update_participants
on public.sessions for update
to authenticated
using (
  participant_a = auth.uid()
  or participant_b = auth.uid()
)
with check (
  participant_a = auth.uid()
  or participant_b = auth.uid()
);

grant select, insert on public.sessions to authenticated;
grant update (status, ended_at) on public.sessions to authenticated;
