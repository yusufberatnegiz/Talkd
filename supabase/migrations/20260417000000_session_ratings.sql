create table if not exists session_ratings (
  id uuid primary key default gen_random_uuid(),
  rated_user_id uuid references profiles(id) on delete set null,
  topic text not null,
  duration_minutes int not null,
  stars int not null check (stars between 1 and 5),
  created_at timestamptz not null default now()
);
