-- ════════════════════════════════════════════════════════════════════
-- Fluentra — Migration 0001: Foundation
-- Identity, settings, languages, and the usage-limit gate.
-- Feature tables (lessons, ai_*, vocabulary, etc.) ship with their phases.
-- ════════════════════════════════════════════════════════════════════

-- ── Enums ──────────────────────────────────────────────────────────
create type user_role          as enum ('user', 'admin');
create type subscription_tier  as enum ('free', 'pro', 'ultimate');
create type cefr_level         as enum ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

-- ── Helpers ────────────────────────────────────────────────────────

-- updated_at auto-touch
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Admin check for RLS. SECURITY DEFINER + fixed search_path avoids
-- recursive RLS evaluation on profiles and privilege confusion.
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── profiles ───────────────────────────────────────────────────────
create table profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  display_name      text,
  avatar_url        text,
  role              user_role         not null default 'user',
  subscription_tier subscription_tier not null default 'free',
  onboarded         boolean           not null default false,
  created_at        timestamptz       not null default now(),
  updated_at        timestamptz       not null default now()
);

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Prevent privilege escalation: a non-admin cannot change their own
-- role or subscription_tier via a profile update. RLS can't restrict
-- columns, so we guard with a trigger.
create or replace function guard_protected_profile_columns()
returns trigger language plpgsql as $$
begin
  if not is_admin() then
    if new.role is distinct from old.role then
      raise exception 'not allowed to change role';
    end if;
    if new.subscription_tier is distinct from old.subscription_tier then
      raise exception 'subscription_tier is set by billing, not by users';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_guard_protected
  before update on profiles
  for each row execute function guard_protected_profile_columns();

-- Auto-create a profile row when an auth user is created.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

alter table profiles enable row level security;

create policy "profiles: read own"   on profiles for select using (auth.uid() = id);
create policy "profiles: admin read"  on profiles for select using (is_admin());
create policy "profiles: update own"  on profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles: admin update" on profiles for update using (is_admin());

-- ── user_settings ──────────────────────────────────────────────────
create table user_settings (
  user_id       uuid primary key references profiles(id) on delete cascade,
  theme         text  not null default 'system',          -- 'light' | 'dark' | 'system'
  locale        text  not null default 'en',              -- 'en' | 'ka' | ...
  notifications jsonb not null default '{"email":true,"push":false}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger user_settings_updated_at
  before update on user_settings
  for each row execute function set_updated_at();

alter table user_settings enable row level security;

create policy "settings: own"        on user_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "settings: admin read" on user_settings for select using (is_admin());

-- ── languages (catalog) ────────────────────────────────────────────
create table languages (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,        -- ISO 639-1, e.g. 'en', 'ka'
  name        text not null,               -- English name
  native_name text not null,               -- endonym
  flag_emoji  text,
  is_active   boolean not null default true,
  sort_order  int     not null default 0
);

create index languages_active_idx on languages (is_active, sort_order);

alter table languages enable row level security;

create policy "languages: public read" on languages for select using (true);
create policy "languages: admin write" on languages for all using (is_admin()) with check (is_admin());

-- ── user_languages ─────────────────────────────────────────────────
create table user_languages (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references profiles(id) on delete cascade,
  native_language_id uuid not null references languages(id),
  target_language_id uuid not null references languages(id),
  level              cefr_level not null default 'A1',
  daily_goal_minutes int  not null default 15,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint different_languages check (native_language_id <> target_language_id),
  unique (user_id, target_language_id)
);

create index user_languages_user_idx on user_languages (user_id, is_active);

create trigger user_languages_updated_at
  before update on user_languages
  for each row execute function set_updated_at();

alter table user_languages enable row level security;

create policy "user_languages: own"        on user_languages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_languages: admin read" on user_languages for select using (is_admin());

-- ── usage_limits (the cost/plan gate) ──────────────────────────────
-- One row per user per UTC day. Phase 3 reads/increments this before
-- every AI call; Phase 4 sets the *_limit values from the active plan.
create table usage_limits (
  user_id             uuid not null references profiles(id) on delete cascade,
  period_date         date not null default (now() at time zone 'utc')::date,
  ai_messages_used    int  not null default 0,
  ai_messages_limit   int  not null default 10,    -- free tier default
  voice_seconds_used  int  not null default 0,
  voice_seconds_limit int  not null default 0,
  updated_at          timestamptz not null default now(),
  primary key (user_id, period_date)
);

create trigger usage_limits_updated_at
  before update on usage_limits
  for each row execute function set_updated_at();

alter table usage_limits enable row level security;

create policy "usage: read own"     on usage_limits for select using (auth.uid() = user_id);
create policy "usage: admin read"   on usage_limits for select using (is_admin());
-- Writes go through the service role from server routes (bypasses RLS),
-- so no user INSERT/UPDATE policy is granted by design.

-- ── Seed: language catalog ─────────────────────────────────────────
insert into languages (code, name, native_name, flag_emoji, sort_order) values
  ('en', 'English',    'English',    '🇬🇧', 1),
  ('es', 'Spanish',    'Español',    '🇪🇸', 2),
  ('fr', 'French',     'Français',   '🇫🇷', 3),
  ('de', 'German',     'Deutsch',    '🇩🇪', 4),
  ('it', 'Italian',    'Italiano',   '🇮🇹', 5),
  ('pt', 'Portuguese', 'Português',  '🇵🇹', 6),
  ('ja', 'Japanese',   '日本語',      '🇯🇵', 7),
  ('zh', 'Chinese',    '中文',        '🇨🇳', 8),
  ('ko', 'Korean',     '한국어',      '🇰🇷', 9),
  ('ar', 'Arabic',     'العربية',     '🇸🇦', 10),
  ('ru', 'Russian',    'Русский',    '🇷🇺', 11),
  ('tr', 'Turkish',    'Türkçe',     '🇹🇷', 12),
  ('ka', 'Georgian',   'ქართული',    '🇬🇪', 13);
