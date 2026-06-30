import type { Metadata } from "next";
import type Stripe from "stripe";
import Link from "next/link";
import {
  CreditCard,
  Zap,
  Mic,
  BookOpen,
  Layers,
  ReceiptText,
  Download,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  ShieldCheck,
  Crown,
} from "lucide-react";
import { requireUserPage } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { PLANS, SOFT_UNLIMITED } from "@/config/plans";
import { env } from "@/lib/env";
import { routes } from "@/config/site";
import { BillingActions } from "@/components/billing/billing-actions";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Billing — Fluentra" };

/* ── Formatters ────────────────────────────────────────────────── */

function fmtCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

function fmtDate(value: string | number) {
  const d = typeof value === "number" ? new Date(value * 1000) : new Date(value);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtDateLong(value: string | number) {
  const d = typeof value === "number" ? new Date(value * 1000) : new Date(value);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/* ── Status config ─────────────────────────────────────────────── */

const STATUS_CONFIG: Record<
  string,
  { label: string; Icon: React.ComponentType<{ className?: string }>; cls: string }
> = {
  active: {
    label: "Active",
    Icon: CheckCircle2,
    cls: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400",
  },
  trialing: {
    label: "Trial",
    Icon: Clock,
    cls: "text-blue-600 bg-blue-500/10 border-blue-500/20 dark:text-blue-400",
  },
  past_due: {
    label: "Past due",
    Icon: AlertTriangle,
    cls: "text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400",
  },
  canceled: {
    label: "Canceled",
    Icon: AlertTriangle,
    cls: "text-red-600 bg-red-500/10 border-red-500/20 dark:text-red-400",
  },
  inactive: {
    label: "Free plan",
    Icon: Sparkles,
    cls: "text-muted-foreground bg-muted border-border",
  },
};

/* ── Tier accent map ───────────────────────────────────────────── */

const TIER_ACCENT = {
  free: "",
  pro: "border-primary/25 shadow-[0_0_0_1px_hsl(var(--primary)/0.1),var(--shadow-sm)]",
  ultimate:
    "border-violet-500/25 shadow-[0_0_0_1px_rgba(139,92,246,0.12),var(--shadow-sm)]",
} as const;

const TIER_GRADIENT = {
  free: "",
  pro: "bg-gradient-to-br from-card via-card to-primary/[0.04]",
  ultimate: "bg-gradient-to-br from-card via-card to-violet-950/20",
} as const;

/* ── Invoice status badge ──────────────────────────────────────── */

const INVOICE_STATUS: Record<string, { label: string; cls: string }> = {
  paid: {
    label: "Paid",
    cls: "text-emerald-700 bg-emerald-500/10 dark:text-emerald-400",
  },
  open: { label: "Open", cls: "text-amber-700 bg-amber-500/10 dark:text-amber-400" },
  void: { label: "Void", cls: "text-muted-foreground bg-muted" },
  uncollectible: { label: "Failed", cls: "text-red-700 bg-red-500/10 dark:text-red-400" },
};

/* ── Card brand display ────────────────────────────────────────── */

const CARD_BRANDS: Record<string, { label: string; cls: string }> = {
  visa: {
    label: "VISA",
    cls: "text-blue-600 bg-blue-500/10 dark:text-blue-400",
  },
  mastercard: {
    label: "MC",
    cls: "text-red-600 bg-red-500/10 dark:text-red-400",
  },
  amex: {
    label: "AMEX",
    cls: "text-emerald-700 bg-emerald-500/10 dark:text-emerald-400",
  },
  discover: {
    label: "DISC",
    cls: "text-orange-600 bg-orange-500/10 dark:text-orange-400",
  },
  unionpay: {
    label: "UP",
    cls: "text-rose-600 bg-rose-500/10 dark:text-rose-400",
  },
};

/* ── Main page ─────────────────────────────────────────────────── */

export default async function BillingPage() {
  const { user, profile } = await requireUserPage();
  const tier = profile?.subscription_tier ?? "free";
  const plan = PLANS[tier];
  const admin = createAdminClient();

  /* Subscription row */
  const { data: sub } = await admin
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  /* Today's API-tracked usage */
  const today = new Date().toISOString().slice(0, 10);
  const { data: usage } = await admin
    .from("usage_limits")
    .select("ai_messages_used, ai_messages_limit, voice_seconds_used, voice_seconds_limit")
    .eq("user_id", user.id)
    .eq("period_date", today)
    .maybeSingle();

  /* Lifetime counts from feature tables (graceful — tables may not exist yet) */
  let lessonsCompleted = 0;
  let vocabularyCount = 0;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (admin as any)
      .from("lesson_completions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    lessonsCompleted = count ?? 0;
  } catch {}
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (admin as any)
      .from("user_vocabulary")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    vocabularyCount = count ?? 0;
  } catch {}

  /* Stripe data — only if configured and customer exists */
  type Invoice = {
    id: string;
    number: string | null;
    status: string | null;
    amount: number;
    currency: string;
    created: number;
    pdf: string | null;
    hosted: string | null;
    discount: string | null;
  };
  type PaymentMethod = {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  type PlanPrice = {
    amount: number;
    currency: string;
    interval: string;
  };

  let invoices: Invoice[] = [];
  let paymentMethod: PaymentMethod | null = null;
  let planPrice: PlanPrice | null = null;

  if (env.STRIPE_SECRET_KEY && sub?.stripe_customer_id) {
    try {
      const stripe = getStripe();

      const [invoiceList, customer, priceData] = await Promise.all([
        stripe.invoices.list({ customer: sub.stripe_customer_id, limit: 12 }),
        stripe.customers.retrieve(sub.stripe_customer_id, {
          expand: ["invoice_settings.default_payment_method"],
        }),
        sub.stripe_price_id
          ? stripe.prices.retrieve(sub.stripe_price_id)
          : Promise.resolve(null),
      ]);

      invoices = invoiceList.data.map((inv) => ({
        id: inv.id,
        number: inv.number ?? null,
        status: inv.status ?? null,
        amount: inv.amount_paid,
        currency: inv.currency,
        created: inv.created,
        pdf: inv.invoice_pdf ?? null,
        hosted: inv.hosted_invoice_url ?? null,
        discount:
          (inv.discount as { coupon?: { name?: string } } | null)?.coupon?.name ?? null,
      }));

      const cust = customer as Stripe.Customer;
      const pm = cust.invoice_settings
        ?.default_payment_method as Stripe.PaymentMethod | null;
      if (pm?.card) {
        paymentMethod = {
          brand: pm.card.brand,
          last4: pm.card.last4,
          exp_month: pm.card.exp_month,
          exp_year: pm.card.exp_year,
        };
      }

      if (priceData?.unit_amount) {
        planPrice = {
          amount: priceData.unit_amount,
          currency: priceData.currency,
          interval: priceData.recurring?.interval ?? "month",
        };
      }
    } catch {
      /* Stripe not reachable — degrade gracefully */
    }
  }

  /* Derived values */
  const subStatus = sub?.status ?? "inactive";
  const statusCfg = STATUS_CONFIG[subStatus] ?? STATUS_CONFIG.inactive!;
  const StatusIcon = statusCfg.Icon;

  const trialEnd = sub?.trial_end ? new Date(sub.trial_end) : null;
  const trialDaysLeft = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / 86_400_000))
    : 0;

  const aiUsed = usage?.ai_messages_used ?? 0;
  const aiLimit = usage?.ai_messages_limit ?? plan.limits.aiMessagesPerDay;
  const voiceUsed = Math.round((usage?.voice_seconds_used ?? 0) / 60);
  const voiceLimit = Math.round(
    (usage?.voice_seconds_limit ?? plan.limits.voiceSecondsPerDay) / 60,
  );

  const isFree = tier === "free";
  const hasSub = !!sub?.stripe_subscription_id;
  const cancelAtPeriodEnd = sub?.cancel_at_period_end ?? false;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your plan, payment method, and invoices.
        </p>
      </div>

      {/* ── Plan card ────────────────────────────────────────── */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border bg-card p-6",
          TIER_ACCENT[tier],
          TIER_GRADIENT[tier],
          !tier || tier === "free"
            ? "border-border shadow-[var(--shadow-sm)]"
            : "",
        )}
      >
        {/* Decorative top line for paid tiers */}
        {!isFree && (
          <div
            className={cn(
              "absolute inset-x-0 top-0 h-px",
              tier === "ultimate"
                ? "bg-gradient-to-r from-transparent via-violet-400/60 to-transparent"
                : "bg-gradient-to-r from-transparent via-primary/50 to-transparent",
            )}
          />
        )}

        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Left: plan info */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Current plan
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {!isFree && (
                tier === "ultimate"
                  ? <Crown className="size-5 text-violet-400" />
                  : <Sparkles className="size-5 text-primary" />
              )}
              <p className="font-display text-2xl font-bold">{plan.name}</p>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold",
                  statusCfg.cls,
                )}
              >
                <StatusIcon className="size-3" />
                {statusCfg.label}
              </span>
            </div>

            {/* Price + interval */}
            {planPrice && (
              <p className="text-sm font-semibold text-foreground/80">
                {fmtCurrency(planPrice.amount, planPrice.currency)}
                <span className="font-normal text-muted-foreground">
                  {" "}/ {planPrice.interval}
                </span>
              </p>
            )}
            {isFree && (
              <p className="text-sm text-muted-foreground">{plan.blurb}</p>
            )}

            {/* Renewal / period */}
            {sub?.current_period_end && !cancelAtPeriodEnd && subStatus === "active" && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="size-3.5" />
                <span>Renews {fmtDateLong(sub.current_period_end)}</span>
                {sub.coupon_id && (
                  <span className="ml-1 text-emerald-600 dark:text-emerald-400">
                    · Coupon: {sub.coupon_id}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right: action buttons */}
          <BillingActions
            tier={tier}
            hasSub={hasSub}
            subStatus={subStatus}
            cancelAtPeriodEnd={cancelAtPeriodEnd}
          />
        </div>

        {/* Trial banner */}
        {subStatus === "trialing" && trialDaysLeft > 0 && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
            <Clock className="size-4 shrink-0" />
            <span>
              Your free trial ends in{" "}
              <strong>
                {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""}
              </strong>
              . You won&apos;t be charged until{" "}
              {trialEnd?.toLocaleDateString("en-US", { month: "long", day: "numeric" })}.
            </span>
          </div>
        )}

        {/* Cancel at period end warning */}
        {cancelAtPeriodEnd && sub?.current_period_end && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            <AlertTriangle className="size-4 shrink-0" />
            <span>
              Cancels on{" "}
              <strong>{fmtDateLong(sub.current_period_end)}</strong>. Your access
              continues until then.
            </span>
          </div>
        )}

        {/* Past due warning */}
        {subStatus === "past_due" && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            <AlertTriangle className="size-4 shrink-0" />
            <span>
              Your last payment failed. Please update your payment method to keep
              access.
            </span>
          </div>
        )}

        {/* Free tier upgrade prompt */}
        {isFree && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
            <ShieldCheck className="size-5 shrink-0 text-primary" />
            <div className="flex-1 text-sm">
              <p className="font-medium text-foreground">Unlock the full experience</p>
              <p className="text-muted-foreground">
                Upgrade to Pro for unlimited AI chat, voice conversations, and more.
              </p>
            </div>
            <Link
              href={routes.pricing}
              className="shrink-0 text-sm font-semibold text-primary hover:underline"
            >
              See plans →
            </Link>
          </div>
        )}
      </div>

      {/* ── Payment method + Usage grid ──────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment method card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-sm)]">
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Payment method</h2>
          </div>

          {paymentMethod ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CardBrandBadge brand={paymentMethod.brand} />
                <div>
                  <p className="font-mono text-sm font-medium tracking-wider">
                    •••• •••• •••• {paymentMethod.last4}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expires {String(paymentMethod.exp_month).padStart(2, "0")}/
                    {String(paymentMethod.exp_year).slice(-2)}
                  </p>
                </div>
              </div>
              <BillingActions tier={tier} hasSub={hasSub} subStatus={subStatus} cancelAtPeriodEnd={cancelAtPeriodEnd} portalOnly />
            </div>
          ) : isFree ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                No payment method on file. Add one when you upgrade.
              </p>
              <Link
                href={routes.pricing}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                View plans →
              </Link>
            </div>
          ) : sub?.stripe_customer_id ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Manage your payment details in the billing portal.
              </p>
              <BillingActions tier={tier} hasSub={hasSub} subStatus={subStatus} cancelAtPeriodEnd={cancelAtPeriodEnd} portalOnly />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No billing account found.</p>
          )}
        </div>

        {/* Usage card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-sm)]">
          <h2 className="mb-4 text-sm font-semibold">Usage</h2>
          <div className="space-y-4">
            <UsageBar
              Icon={Zap}
              label="AI messages"
              used={aiUsed}
              limit={aiLimit}
              unit="msg"
              period="today"
            />
            <UsageBar
              Icon={Mic}
              label="Voice"
              used={voiceUsed}
              limit={voiceLimit}
              unit="min"
              period="today"
            />
            <div className="border-t border-border pt-3 space-y-3">
              <StatRow Icon={BookOpen} label="Lessons completed" value={lessonsCompleted} />
              <StatRow Icon={Layers} label="Vocabulary words" value={vocabularyCount} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Invoice history ───────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <ReceiptText className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Invoice history</h2>
        </div>

        {invoices.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <ReceiptText className="mx-auto mb-3 size-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">No invoices yet</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Invoices will appear here after your first payment.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between px-6 py-3.5 text-sm hover:bg-muted/30 transition-colors"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-baseline gap-2">
                    <p className="font-semibold tabular-nums">
                      {fmtCurrency(inv.amount, inv.currency)}
                    </p>
                    {inv.number && (
                      <p className="truncate text-xs text-muted-foreground">
                        #{inv.number}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{fmtDate(inv.created)}</span>
                    {inv.discount && (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        · {inv.discount}
                      </span>
                    )}
                  </div>
                </div>

                <div className="ml-4 flex shrink-0 items-center gap-3">
                  <InvoiceStatusBadge status={inv.status} />
                  {inv.pdf && (
                    <a
                      href={inv.pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title="Download PDF"
                    >
                      <Download className="size-4" />
                    </a>
                  )}
                  {inv.hosted && (
                    <a
                      href={inv.hosted}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title="View invoice"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Helper components ──────────────────────────────────────────── */

function UsageBar({
  Icon,
  label,
  used,
  limit,
  unit,
  period,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  used: number;
  limit: number;
  unit: string;
  period: string;
}) {
  const unlimited = limit <= 0 || limit >= SOFT_UNLIMITED;
  const pct = unlimited ? 0 : Math.min((used / limit) * 100, 100);
  const danger = pct >= 90;
  const warn = pct >= 70;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="size-3.5" />
          {label}
          <span className="text-[10px] opacity-60">({period})</span>
        </span>
        <span
          className={cn(
            "font-semibold tabular-nums",
            danger
              ? "text-destructive"
              : warn
                ? "text-amber-500"
                : "",
          )}
        >
          {unlimited ? (
            <span className="text-emerald-600 dark:text-emerald-400">Unlimited</span>
          ) : (
            `${used} / ${limit} ${unit}`
          )}
        </span>
      </div>
      {!unlimited && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              danger
                ? "bg-destructive"
                : warn
                  ? "bg-amber-500"
                  : "bg-primary",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

function StatRow({
  Icon,
  label,
  value,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className="font-semibold tabular-nums text-foreground">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

function CardBrandBadge({ brand }: { brand: string }) {
  const b =
    CARD_BRANDS[brand.toLowerCase()] ?? {
      label: brand.toUpperCase(),
      cls: "text-muted-foreground bg-muted",
    };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded px-2 py-1 text-[11px] font-bold tracking-wider",
        b.cls,
      )}
    >
      {b.label}
    </span>
  );
}

function InvoiceStatusBadge({ status }: { status: string | null }) {
  const s =
    INVOICE_STATUS[status ?? ""] ?? {
      label: status ?? "—",
      cls: "text-muted-foreground bg-muted",
    };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        s.cls,
      )}
    >
      {s.label}
    </span>
  );
}
