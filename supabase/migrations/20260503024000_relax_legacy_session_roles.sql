do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'sessions'
      and column_name = 'user1_role'
  ) then
    alter table public.sessions alter column user1_role drop not null;

    update public.sessions
    set user1_role = case
      when intent_a in ('listen', 'listener') then 'LISTENER'
      when intent_a is not null then 'TALKER'
      else user1_role
    end
    where user1_role is null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'sessions'
      and column_name = 'user2_role'
  ) then
    alter table public.sessions alter column user2_role drop not null;

    update public.sessions
    set user2_role = case
      when intent_b in ('listen', 'listener') then 'LISTENER'
      when intent_b is not null then 'TALKER'
      else user2_role
    end
    where user2_role is null;
  end if;
end $$;
