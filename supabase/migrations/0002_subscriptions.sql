-- ════════════════════════════════════════════════════════════════════
-- Fluentra — Migration 0002: Subscriptions & Billing
-- One row per user; links Stripe customer → subscription → our tier.
-- ════════════════════════════════════════════════════════════════════

create table subscriptions (
  id                     uuid        primary key default gen_random_uuid(),
  user_id                uuid        not null unique references profiles(id) on delete cascade,
  stripe_customer_id     text        not null unique,
  stripe_subscription_id text        unique,
  stripe_price_id        text,
  tier                   subscription_tier not null default 'free',
  status                 text        not null default 'inactive',
  -- 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'paused' | 'unpaid'
  trial_end              timestamptz,
  current_period_end     timestamptz,
  cancel_at_period_end   boolean     not null default false,
  coupon_id              text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create trigger subscriptions_updated_at
  before update on subscriptions
  for each row execute function set_updated_at();

alter table subscriptions enable row level security;

create policy "subscriptions: read own"  on subscriptions for select using (auth.uid() = user_id);
create policy "subscriptions: admin all" on subscriptions for all   using (is_admin()) with check (is_admin());
-- Writes only via service role (webhook handler bypasses RLS by design).

create index subscriptions_customer_idx on subscriptions (stripe_customer_id);
create index subscriptions_subscription_idx on subscriptions (stripe_subscription_id);
