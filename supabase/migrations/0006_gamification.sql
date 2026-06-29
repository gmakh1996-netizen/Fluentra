-- ════════════════════════════════════════════════════════════════════
-- 0006 — Gamification: stats, achievements, leaderboard
-- ════════════════════════════════════════════════════════════════════

-- Aggregate per-user stats kept in sync by app logic / triggers (Phase 6).
create table user_stats (
  user_id            uuid primary key references profiles(id) on delete cascade,
  total_xp           int not null default 0,
  level              int not null default 1,
  current_streak     int not null default 0,
  longest_streak     int not null default 0,
  last_activity_date date,
  updated_at         timestamptz not null default now()
);
create trigger user_stats_updated_at before update on user_stats
  for each row execute function set_updated_at();

create table achievements (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null,
  description text not null,
  icon        text,
  xp_reward   int not null default 0,
  criteria    jsonb not null default '{}'::jsonb,
  is_active   boolean not null default true
);

create table user_achievements (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references profiles(id) on delete cascade,
  achievement_id uuid not null references achievements(id) on delete cascade,
  earned_at      timestamptz not null default now(),
  unique (user_id, achievement_id)
);
create index user_achievements_user_idx on user_achievements (user_id);

-- Leaderboard.
-- A plain view would run with the owner's rights and bypass the "read own row"
-- RLS on user_stats, leaking everyone's data. Instead expose a deliberate,
-- minimal projection (no user_id, no private fields) via a SECURITY DEFINER
-- function with a locked search_path. This is the only sanctioned way to read
-- across users.
create or replace function get_leaderboard(limit_count int default 50)
returns table (
  rank bigint, display_name text, avatar_url text, total_xp int, level int, current_streak int
)
language sql
security definer
set search_path = public
stable as $$
  select row_number() over (order by s.total_xp desc) as rank,
         p.display_name, p.avatar_url, s.total_xp, s.level, s.current_streak
  from user_stats s
  join profiles p on p.id = s.user_id
  order by s.total_xp desc
  limit greatest(1, least(limit_count, 200));
$$;

alter table user_stats         enable row level security;
alter table achievements       enable row level security;
alter table user_achievements  enable row level security;

create policy "stats: read own"   on user_stats for select using (auth.uid() = user_id);
create policy "stats: admin read" on user_stats for select using (is_admin());
-- stats writes via service role only.

create policy "achievements: public read" on achievements for select using (is_active or is_admin());
create policy "achievements: admin write" on achievements for all using (is_admin()) with check (is_admin());

create policy "user_achievements: read own" on user_achievements for select using (auth.uid() = user_id);
create policy "user_achievements: admin read" on user_achievements for select using (is_admin());
-- awarding achievements is done server-side via service role.
