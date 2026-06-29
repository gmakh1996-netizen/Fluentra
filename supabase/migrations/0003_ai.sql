-- ════════════════════════════════════════════════════════════════════
-- 0003 — AI conversations & messages
-- ════════════════════════════════════════════════════════════════════

create type conversation_mode as enum (
  'casual', 'business', 'travel', 'interview', 'pronunciation', 'grammar'
);
create type message_role as enum ('system', 'user', 'assistant');

create table ai_conversations (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references profiles(id) on delete cascade,
  target_language_id uuid references languages(id),
  mode               conversation_mode not null default 'casual',
  level              cefr_level not null default 'A1',
  title              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index ai_conversations_user_idx on ai_conversations (user_id, updated_at desc);
create trigger ai_conversations_updated_at before update on ai_conversations
  for each row execute function set_updated_at();

create table ai_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid references ai_conversations(id) on delete cascade,
  user_id         uuid not null references profiles(id) on delete cascade,
  role            message_role not null,
  content         text not null,
  model           text,
  tokens_in       int,
  tokens_out      int,
  created_at      timestamptz not null default now()
);
create index ai_messages_conversation_idx on ai_messages (conversation_id, created_at);
create index ai_messages_user_idx on ai_messages (user_id, created_at desc);

alter table ai_conversations enable row level security;
alter table ai_messages      enable row level security;

create policy "conversations: own"        on ai_conversations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "conversations: admin read"  on ai_conversations for select using (is_admin());

-- Users read their own messages; inserts come from the server (service role).
create policy "messages: read own"   on ai_messages for select using (auth.uid() = user_id);
create policy "messages: admin read" on ai_messages for select using (is_admin());
