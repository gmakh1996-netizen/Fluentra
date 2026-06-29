import type { Metadata } from "next";
import { Users, CreditCard, BarChart3, Download, FileText } from "lucide-react";

export const metadata: Metadata = { title: "Reports" };

const REPORTS = [
  {
    title:       "All Users",
    description: "Full user list with roles, tiers, and sign-in dates.",
    icon:        Users,
    href:        "/api/admin/reports?type=users",
    filename:    "fluentra-users.csv",
  },
  {
    title:       "Subscriptions",
    description: "All subscription rows with tier, status, and billing dates.",
    icon:        CreditCard,
    href:        "/api/admin/reports?type=subscriptions",
    filename:    "fluentra-subscriptions.csv",
  },
  {
    title:       "AI Usage",
    description: "Daily AI messages and voice seconds per user.",
    icon:        BarChart3,
    href:        "/api/admin/reports?type=usage",
    filename:    "fluentra-usage.csv",
  },
] as const;

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">Download platform data as CSV files.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map(({ title, description, icon: Icon, href, filename }) => (
          <div key={title} className="flex flex-col rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600">
                <Icon className="size-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            <a
              href={href}
              download={filename}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border bg-muted px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted/70"
            >
              <Download className="size-4" /> Download CSV
            </a>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Note</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              CSV downloads are admin-only — the endpoint verifies your role before responding.
              Reports reflect the current live database state; deleted records are excluded.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
