insert into public.profiles (id, created_at, updated_at)
select users.id, now(), now()
from auth.users
where users.id is not null
on conflict (id) do nothing;
