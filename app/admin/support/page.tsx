import type { Metadata } from "next";
import { MessageSquare, Mail, CheckCircle2, AlertCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Support" };

export default function AdminSupportPage() {
  const resendConfigured = !!process.env.RESEND_API_KEY;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Support</h1>
        <p className="mt-1 text-sm text-muted-foreground">Contact form configuration and delivery status.</p>
      </div>

      {/* Integration status */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
        <p className="text-sm font-semibold">Integration status</p>
        <div className="flex items-start gap-3 rounded-xl border px-4 py-3">
          {resendConfigured ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Resend — email delivery</p>
              <span className={cn(
                "rounded-full px-2 py-0.5 text-xs font-semibold",
                resendConfigured
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
              )}>
                {resendConfigured ? "Active" : "Not configured"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {resendConfigured
                ? "RESEND_API_KEY is set — contact form submissions are delivered to support@fluentra.app."
                : "Add RESEND_API_KEY to Vercel environment variables. Contact form submissions will fail with HTTP 501 until configured."}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border px-4 py-3">
          <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Delivery address</p>
              <code className="rounded bg-muted px-2 py-0.5 text-xs">support@fluentra.app</code>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              All contact form messages are forwarded here with reply-to set to the sender.
            </p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="size-4 text-muted-foreground" />
          <p className="text-sm font-semibold">How contact forms work</p>
        </div>
        <ol className="space-y-3">
          {[
            { step: 1, text: "User submits /contact with name, email, and message (10–4000 chars)." },
            { step: 2, text: "POST /api/contact validates input and checks rate limit — 5 requests/hour per IP." },
            { step: 3, text: "Resend delivers to support@fluentra.app with reply-to set to the user's email." },
            { step: 4, text: "Support team replies directly from their email client — no in-app inbox needed." },
          ].map(({ step, text }) => (
            <li key={step} className="flex gap-3 text-sm">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30 text-[11px] font-bold text-violet-600">
                {step}
              </span>
              <span className="text-muted-foreground">{text}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Future inbox placeholder */}
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-muted/30 p-10 text-center">
        <MessageSquare className="size-8 text-muted-foreground" />
        <p className="font-medium">In-app support inbox</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Add a <code className="rounded bg-muted px-1.5 py-0.5 text-xs">contact_submissions</code> table,
          persist submissions in the contact route, and display them here for in-app triage and reply tracking.
        </p>
      </div>
    </div>
  );
}
