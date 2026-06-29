import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Download, ReceiptText, Zap, Mic, CreditCard, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { requireUserPage } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { PLANS } from "@/config/plans";
import { env } from "@/lib/env";
import { routes } from "@/config/site";
import { Badge } from "@/components/ui/badge";
import { BillingActions } from "@/components/billing/billing-actions";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Billing — Fluentra" };

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase(), minimumFractionDigits: 2 }).format(amount / 100);
}

function fmtDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_STYLE: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  active:     { label: "Active",      icon: CheckCircle2,  cls: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
  trialing:   { label: "Trial",       icon: Clock,         cls: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  past_due:   { label: "Past due",    icon: AlertTriangle, cls: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  canceled:   { label: "Canceled",    icon: AlertTriangle, cls: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800" },
  inactive:   { label: "Free plan",   icon: Zap,           cls: "text-muted-foreground bg-muted border-border" },
};

export default async function BillingPage() {
  const { user, profile } = await requireUserPage();
  const tier = profile?.subscription_tier ?? "free";
  const plan = PLANS[tier];
  const admin = createAdminClient();

  // Subscription row
  const { data: sub } = await admin
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Today's usage
  const today = new Date().toISOString().slice(0, 10);
  const { data: usage } = await admin
    .from("usage_limits")
    .select("ai_messages_used, ai_messages_limit, voice_seconds_used, voice_seconds_limit")
    .eq("user_id", user.id)
    .eq("period_date", today)
    .maybeSingle();

  // Invoices (only if Stripe configured + customer exists)
  type Invoice = { id: string; number: string | null; status: string | null; amount: number; currency: string; created: number; pdf: string | null; hosted: string | null; discount: string | null };
  let invoices: Invoice[] = [];
  if (env.STRIPE_SECRET_KEY && sub?.stripe_customer_id) {
    try {
      const stripe = getStripe();
      const list = await stripe.invoices.list({ customer: sub.stripe_customer_id, limit: 12 });
      invoices = list.data.map((inv) => ({
        id: inv.id,
        number: inv.number ?? null,
        status: inv.status ?? null,
        amount: inv.amount_paid,
        currency: inv.currency,
        created: inv.created,
        pdf: inv.invoice_pdf ?? null,
        hosted: inv.hosted_invoice_url ?? null,
        discount: (inv.discount as { coupon?: { name?: string } } | null)?.coupon?.name ?? null,
      }));
    } catch { /* ignore */ }
  }

  const subStatus = sub?.status ?? "inactive";
  const statusStyle = STATUS_STYLE[subStatus] ?? STATUS_STYLE.inactive!;
  const StatusIcon = statusStyle!.icon;

  const trialEnd = sub?.trial_end ? new Date(sub.trial_end) : null;
  const trialDaysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / 86400000)) : 0;

  const aiUsed = usage?.ai_messages_used ?? 0;
  const aiLimit = usage?.ai_messages_limit ?? plan.limits.aiMessagesPerDay;
  const voiceUsed = usage?.voice_seconds_used ?? 0;
  const voiceLimit = usage?.voice_seconds_limit ?? plan.limits.voiceSecondsPerDay;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your plan, payment method, and invoices.</p>
      </div>

      {/* Current plan card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-sm)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Current plan</p>
            <div className="flex items-center gap-2">
              <p className="font-display text-2xl font-bold">{plan.name}</p>
              <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold", statusStyle!.cls)}>
                <StatusIcon className="size-3" />
                {statusStyle!.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{plan.blurb}</p>
          </div>
          <BillingActions tier={tier} hasSub={!!sub?.stripe_subscription_id} />
        </div>

        {/* Trial banner */}
        {subStatus === "trialing" && trialDaysLeft > 0 && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
            <Clock className="size-4 shrink-0" />
            <span>Your free trial ends in <strong>{trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""}</strong>. You won't be charged until {trialEnd?.toLocaleDateString("en-US", { month: "long", day: "numeric" })}.</span>
          </div>
        )}

        {/* Cancel at period end */}
        {sub?.cancel_at_period_end && sub.current_period_end && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            <AlertTriangle className="size-4 shrink-0" />
            <span>Cancels on <strong>{new Date(sub.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>. Your access continues until then.</span>
          </div>
        )}

        {/* Period end */}
        {sub?.current_period_end && !sub.cancel_at_period_end && subStatus === "active" && (
          <p className="mt-4 text-xs text-muted-foreground">
            Next renewal: {new Date(sub.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            {sub.coupon_id && <span className="ml-2 text-emerald-600">· Coupon applied: {sub.coupon_id}</span>}
          </p>
        )}
      </div>

      {/* Usage */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-sm)]">
        <h2 className="mb-4 text-sm font-semibold">Today&apos;s usage</h2>
        <div className="space-y-4">
          <UsageBar icon={Zap} label="AI messages" used={aiUsed} limit={aiLimit} unit="msg" />
          <UsageBar icon={Mic} label="Voice" used={Math.round(voiceUsed / 60)} limit={Math.round(voiceLimit / 60)} unit="min" />
        </div>
        {tier === "free" && (
          <p className="mt-4 text-xs text-muted-foreground">
            Upgrade to <Link href={routes.billing} className="font-medium text-primary hover:underline">Pro</Link> for unlimited AI messages and 30 min/day voice.
          </p>
        )}
      </div>

      {/* Invoices */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-sm)]">
        <div className="mb-4 flex items-center gap-2">
          <ReceiptText className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Invoice history</h2>
        </div>
        {invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No invoices yet. They&apos;ll appear here after your first payment.</p>
        ) : (
          <div className="divide-y divide-border">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-3 text-sm">
                <div className="space-y-0.5">
                  <p className="font-medium">{fmt(inv.amount, inv.currency)}</p>
                  <p className="text-xs text-muted-foreground">
                    {fmtDate(inv.created)}
                    {inv.discount && <span className="ml-2 text-emerald-600">· {inv.discount}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <InvoiceStatus status={inv.status} />
                  {inv.pdf && (
                    <a href={inv.pdf} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" title="Download PDF">
                      <Download className="size-4" />
                    </a>
                  )}
                  {inv.hosted && (
                    <a href={inv.hosted} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" title="View invoice">
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment method / portal link */}
      {sub?.stripe_customer_id && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-3">
            <CreditCard className="size-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Payment method &amp; billing details</p>
              <p className="text-xs text-muted-foreground">Update your card, download invoices, or cancel via the Stripe portal.</p>
            </div>
            <BillingActions tier={tier} hasSub={!!sub?.stripe_subscription_id} portalOnly />
          </div>
        </div>
      )}
    </div>
  );
}

function UsageBar({ icon: Icon, label, used, limit, unit }: { icon: React.ComponentType<{ className?: string }>; label: string; used: number; limit: number; unit: string }) {
  const unlimited = limit <= 0 || limit >= 2000;
  const pct = unlimited ? 0 : Math.min((used / limit) * 100, 100);
  const danger = pct >= 90;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="size-3.5" /> {label}
        </span>
        <span className={cn("font-semibold tabular-nums", danger ? "text-destructive" : "")}>
          {unlimited ? <span className="text-emerald-600">Unlimited</span> : `${used} / ${limit} ${unit}`}
        </span>
      </div>
      {!unlimited && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all", danger ? "bg-destructive" : pct >= 70 ? "bg-amber-500" : "bg-primary")}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

function InvoiceStatus({ status }: { status: string | null }) {
  const map: Record<string, { label: string; cls: string }> = {
    paid:            { label: "Paid",    cls: "text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400" },
    open:            { label: "Open",    cls: "text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400" },
    void:            { label: "Void",    cls: "text-muted-foreground bg-muted" },
    uncollectible:   { label: "Failed",  cls: "text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400" },
  };
  const s = map[status ?? ""] ?? { label: status ?? "—", cls: "text-muted-foreground bg-muted" };
  return <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", s.cls)}>{s.label}</span>;
}
