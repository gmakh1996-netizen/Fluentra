-- ════════════════════════════════════════════════════════════════════
-- 0002 — Lessons & progress
-- ════════════════════════════════════════════════════════════════════

create type lesson_category as enum (
  'beginner_basics', 'everyday_conversation', 'travel', 'business',
  'interviews', 'medical', 'technology', 'culture',
  'grammar_essentials', 'pronunciation_lab'
);
create type lesson_step_type as enum ('content', 'exercise', 'prompt');
create type progress_status  as enum ('not_started', 'in_progress', 'completed');

create table lessons (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  category           lesson_category not null,
  target_language_id uuid not null references languages(id),
  level              cefr_level not null,
  title              text not null,
  description        text,
  duration_minutes   int not null default 10,
  xp_reward          int not null default 50,
  sort_order         int not null default 0,
  is_published       boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index lessons_browse_idx on lessons (target_language_id, level, category, is_published);
create trigger lessons_updated_at before update on lessons
  for each row execute function set_updated_at();

create table lesson_steps (
  id         uuid primary key default gen_random_uuid(),
  lesson_id  uuid not null references lessons(id) on delete cascade,
  step_order int not null,
  type       lesson_step_type not null,
  title      text not null,
  body       jsonb not null default '{}'::jsonb,
  ai_prompt  text,
  unique (lesson_id, step_order)
);
create index lesson_steps_lesson_idx on lesson_steps (lesson_id, step_order);

create table lesson_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  lesson_id    uuid not null references lessons(id) on delete cascade,
  status       progress_status not null default 'not_started',
  score        int,
  xp_earned    int not null default 0,
  completed_at timestamptz,
  updated_at   timestamptz not null default now(),
  unique (user_id, lesson_id)
);
create index lesson_progress_user_idx on lesson_progress (user_id, status);
create trigger lesson_progress_updated_at before update on lesson_progress
  for each row execute function set_updated_at();

-- RLS
alter table lessons          enable row level security;
alter table lesson_steps     enable row level security;
alter table lesson_progress  enable row level security;

create policy "lessons: read published" on lessons for select using (is_published or is_admin());
create policy "lessons: admin write"    on lessons for all using (is_admin()) with check (is_admin());

create policy "steps: read for readable lesson" on lesson_steps for select
  using (exists (select 1 from lessons l where l.id = lesson_id and (l.is_published or is_admin())));
create policy "steps: admin write" on lesson_steps for all using (is_admin()) with check (is_admin());

create policy "progress: own"        on lesson_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "progress: admin read" on lesson_progress for select using (is_admin());
