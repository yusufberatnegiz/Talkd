do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'sessions'
      and column_name = 'id'
      and data_type = 'uuid'
  ) then
    alter table public.sessions alter column id set default gen_random_uuid();
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'sessions'
      and column_name = 'user1_id'
  ) then
    alter table public.sessions alter column user1_id drop not null;
    update public.sessions
    set participant_a = coalesce(participant_a, user1_id)
    where participant_a is null
      and user1_id is not null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'sessions'
      and column_name = 'user2_id'
  ) then
    alter table public.sessions alter column user2_id drop not null;
    update public.sessions
    set participant_b = coalesce(participant_b, user2_id)
    where participant_b is null
      and user2_id is not null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'sessions'
      and column_name = 'duration_minutes'
  ) then
    alter table public.sessions alter column duration_minutes drop not null;
  end if;
end $$;
