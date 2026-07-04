revoke insert on public.sessions from anon, authenticated;

drop policy if exists sessions_insert_participant on public.sessions;

revoke all on function public.create_matched_session(text, text, uuid, uuid, text, text) from public;
revoke all on function public.create_matched_session(text, text, uuid, uuid, text, text) from anon;
revoke all on function public.create_matched_session(text, text, uuid, uuid, text, text) from authenticated;

grant execute on function public.find_or_create_match(text, text, text, text, boolean) to authenticated;
