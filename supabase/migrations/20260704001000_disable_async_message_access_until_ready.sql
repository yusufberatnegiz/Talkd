do $$
declare
  existing_policy record;
  existing_function record;
begin
  if to_regclass('public.async_messages') is not null then
    alter table public.async_messages enable row level security;
    revoke all on public.async_messages from anon, authenticated;

    for existing_policy in
      select policyname
      from pg_policies
      where schemaname = 'public'
        and tablename = 'async_messages'
    loop
      execute format('drop policy if exists %I on public.async_messages', existing_policy.policyname);
    end loop;
  end if;

  if to_regclass('public.async_messages_own') is not null then
    revoke all on public.async_messages_own from anon, authenticated;
  end if;

  if to_regclass('public.async_messages_public') is not null then
    revoke all on public.async_messages_public from anon, authenticated;
  end if;

  for existing_function in
    select p.oid::regprocedure::text as function_identity
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('answer_async_message', 'cleanup_expired_async_messages')
  loop
    execute 'revoke all on function ' || existing_function.function_identity || ' from public, anon, authenticated';
  end loop;
end $$;
