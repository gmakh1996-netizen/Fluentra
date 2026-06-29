-- ════════════════════════════════════════════════════════════════════
-- 0007 — Billing: subscriptions & payments (written by Stripe webhook only)
-- ════════════════════════════════════════════════════════════════════

create table subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid unique references profiles(id) on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text unique,
  status                 text not null default 'incomplete',
  tier                   subscription_tier not null default 'free',
  price_id               text,
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,
  trial_end              timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index subscriptions_customer_idx on subscriptions (stripe_customer_id);
create trigger subscriptions_updated_at before update on subscriptions
  for each row execute function set_updated_at();

create table payments (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid references profiles(id) on delete set null,
  stripe_payment_intent_id text unique,
  amount                   int not null,        -- minor units (cents/tetri)
  currency                 text not null default 'usd',
  status                   text not null,
  invoice_url              text,
  created_at               timestamptz not null default now()
);
create index payments_user_idx on payments (user_id, created_at desc);

alter table subscriptions enable row level security;
alter table payments      enable row level security;

-- Users may READ their own billing; ALL writes go through the Stripe webhook
-- using the service role. No user write policies by design.
create policy "subscriptions: read own"   on subscriptions for select using (auth.uid() = user_id);
create policy "subscriptions: admin read" on subscriptions for select using (is_admin());
create policy "payments: read own"        on payments for select using (auth.uid() = user_id);
create policy "payments: admin read"      on payments for select using (is_admin());
