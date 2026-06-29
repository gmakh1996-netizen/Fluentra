-- ════════════════════════════════════════════════════════════════════
-- 0005 — AI feedback history: grammar, writing, pronunciation, listening
-- ════════════════════════════════════════════════════════════════════

create type writing_type as enum ('essay', 'email', 'job_application', 'message', 'social_post');

create table grammar_corrections (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references profiles(id) on delete cascade,
  target_language_id uuid references languages(id),
  original_text      text not null,
  corrected_text     text not null,
  mistakes           jsonb not null default '[]'::jsonb,
  alternatives       jsonb not null default '[]'::jsonb,
  created_at         timestamptz not null default now()
);
create index grammar_user_idx on grammar_corrections (user_id, created_at desc);

create table writing_reviews (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references profiles(id) on delete cascade,
  target_language_id uuid references languages(id),
  type               writing_type not null,
  original_text      text not null,
  feedback           jsonb not null default '{}'::jsonb,
  tone               text,
  created_at         timestamptz not null default now()
);
create index writing_user_idx on writing_reviews (user_id, created_at desc);

create table pronunciation_sessions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references profiles(id) on delete cascade,
  target_language_id uuid references languages(id),
  phrase             text not null,
  audio_url          text,
  accuracy_score     numeric(5,2),
  fluency_score      numeric(5,2),
  completeness_score numeric(5,2),
  confidence_score   numeric(5,2),
  phoneme_scores     jsonb not null default '[]'::jsonb,
  tips               jsonb not null default '[]'::jsonb,
  graded             boolean not null default false,
  created_at         timestamptz not null default now()
);
create index pronunciation_user_idx on pronunciation_sessions (user_id, created_at desc);

create table listening_sessions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references profiles(id) on delete cascade,
  target_language_id uuid references languages(id),
  title              text not null,
  transcript         text,
  audio_url          text,
  level              cefr_level,
  questions          jsonb not null default '[]'::jsonb,
  answers            jsonb not null default '[]'::jsonb,
  score              int,
  created_at         timestamptz not null default now()
);
create index listening_user_idx on listening_sessions (user_id, created_at desc);

alter table grammar_corrections    enable row level security;
alter table writing_reviews        enable row level security;
alter table pronunciation_sessions enable row level security;
alter table listening_sessions     enable row level security;

create policy "grammar: own"       on grammar_corrections    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "writing: own"       on writing_reviews        for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "pronunciation: own" on pronunciation_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "listening: own"     on listening_sessions     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "grammar: admin read"       on grammar_corrections    for select using (is_admin());
create policy "writing: admin read"       on writing_reviews        for select using (is_admin());
create policy "pronunciation: admin read" on pronunciation_sessions for select using (is_admin());
create policy "listening: admin read"     on listening_sessions     for select using (is_admin());
