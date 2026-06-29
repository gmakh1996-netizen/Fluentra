-- ════════════════════════════════════════════════════════════════════
-- 0004 — Vocabulary & spaced repetition (SM-2)
-- ════════════════════════════════════════════════════════════════════

create type vocab_difficulty as enum ('easy', 'medium', 'hard');

create table vocabulary_items (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references profiles(id) on delete cascade,
  target_language_id uuid not null references languages(id),
  term               text not null,
  translation        text not null,
  example            text,
  audio_url          text,
  category           text,
  difficulty         vocab_difficulty not null default 'medium',
  is_favorite        boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index vocabulary_user_idx on vocabulary_items (user_id, target_language_id);
create index vocabulary_search_idx on vocabulary_items (user_id, category, difficulty);
create trigger vocabulary_items_updated_at before update on vocabulary_items
  for each row execute function set_updated_at();

create table flashcard_reviews (
  id                 uuid primary key default gen_random_uuid(),
  vocabulary_item_id uuid not null references vocabulary_items(id) on delete cascade,
  user_id            uuid not null references profiles(id) on delete cascade,
  -- SM-2 scheduler state
  ease_factor        numeric(4,2) not null default 2.50,
  interval_days      int not null default 0,
  repetitions        int not null default 0,
  due_date           date not null default (now() at time zone 'utc')::date,
  last_grade         int,
  reviewed_at        timestamptz,
  created_at         timestamptz not null default now(),
  unique (vocabulary_item_id)
);
create index flashcard_due_idx on flashcard_reviews (user_id, due_date);

alter table vocabulary_items  enable row level security;
alter table flashcard_reviews enable row level security;

create policy "vocab: own"        on vocabulary_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "vocab: admin read"  on vocabulary_items for select using (is_admin());
create policy "reviews: own"       on flashcard_reviews for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
