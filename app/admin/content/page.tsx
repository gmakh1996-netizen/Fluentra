import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS, TIER_ORDER } from "@/config/plans";
import { Globe, Layers, Zap, Mic, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Content" };

export default async function AdminContentPage() {
  const admin = createAdminClient();
  const { data: languages } = await admin.from("languages").select("*").order("sort_order");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Content / CMS</h1>
        <p className="mt-1 text-sm text-muted-foreground">Languages, subscription plans, and feature configuration.</p>
      </div>

      {/* Languages */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Globe className="size-4 text-muted-foreground" />
          <p className="text-sm font-semibold">Languages ({languages?.length ?? 0})</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-3 pr-6 font-medium">Name</th>
                <th className="pb-3 pr-6 font-medium">Code</th>
                <th className="pb-3 pr-6 font-medium">Native name</th>
                <th className="pb-3 pr-6 font-medium">Sort</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(languages ?? []).map((l) => (
                <tr key={l.id} className="transition-colors hover:bg-muted/30">
                  <td className="py-2.5 pr-6 font-medium">{l.name}</td>
                  <td className="py-2.5 pr-6 font-mono text-xs text-muted-foreground">{l.code}</td>
                  <td className="py-2.5 pr-6 text-muted-foreground">{l.native_name}</td>
                  <td className="py-2.5 pr-6 text-muted-foreground">{l.sort_order}</td>
                  <td className="py-2.5">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      l.is_active
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-muted text-muted-foreground",
                    )}>
                      {l.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
              {!languages?.length && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    No languages in database. Run migrations to seed the languages table.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plans */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Layers className="size-4 text-muted-foreground" />
          <p className="text-sm font-semibold">Subscription plans</p>
          <span className="ml-1 text-xs text-muted-foreground">(from config/plans.ts)</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {TIER_ORDER.map((tier) => {
            const plan = PLANS[tier];
            const isPro      = tier === "pro";
            const isUltimate = tier === "ultimate";
            return (
              <div key={tier} className={cn(
                "rounded-xl border p-4 space-y-3",
                isPro      && "border-primary/40 bg-primary/5",
                isUltimate && "border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-950/20",
              )}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{plan.name}</p>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{tier}</code>
                </div>
                <p className="text-xs text-muted-foreground">{plan.blurb}</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Zap className="size-3 text-violet-500" />
                    {plan.limits.aiMessagesPerDay >= 2000
                      ? "Unlimited AI messages"
                      : `${plan.limits.aiMessagesPerDay} AI messages/day`}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Mic className="size-3 text-blue-500" />
                    {plan.limits.voiceSecondsPerDay === 0
                      ? "No voice"
                      : `${Math.round(plan.limits.voiceSecondsPerDay / 60)} min/day voice`}
                  </div>
                  {plan.trialDays && (
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <Check className="size-3" />
                      {plan.trialDays}-day free trial
                    </div>
                  )}
                </div>
                <ul className="space-y-1 border-t pt-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Check className="mt-0.5 size-3 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
