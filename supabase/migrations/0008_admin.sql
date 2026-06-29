-- ════════════════════════════════════════════════════════════════════
-- 0008 — Support tickets & admin audit log
-- ════════════════════════════════════════════════════════════════════

create type ticket_status   as enum ('open', 'pending', 'resolved', 'closed');
create type ticket_priority as enum ('low', 'normal', 'high', 'urgent');

create table support_tickets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete set null,
  subject     text not null,
  body        text not null,
  status      ticket_status not null default 'open',
  priority    ticket_priority not null default 'normal',
  assigned_to uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index support_tickets_status_idx on support_tickets (status, priority);
create trigger support_tickets_updated_at before update on support_tickets
  for each row execute function set_updated_at();

create table admin_audit_logs (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid not null references profiles(id) on delete cascade,
  action      text not null,
  target_type text,
  target_id   text,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index admin_audit_admin_idx on admin_audit_logs (admin_id, created_at desc);

alter table support_tickets  enable row level security;
alter table admin_audit_logs enable row level security;

-- A user can create a ticket and read their own; admins manage all.
create policy "tickets: create own" on support_tickets for insert with check (auth.uid() = user_id);
create policy "tickets: read own"   on support_tickets for select using (auth.uid() = user_id);
create policy "tickets: admin all"  on support_tickets for all using (is_admin()) with check (is_admin());

-- Audit logs: admin-readable only; writes via service role.
create policy "audit: admin read" on admin_audit_logs for select using (is_admin());
