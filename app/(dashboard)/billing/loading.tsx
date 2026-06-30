import { Skeleton } from "@/components/ui/skeleton";

export default function BillingLoading() {
  return (
    <div className="max-w-3xl space-y-6">
      {/* Page header */}
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Plan card */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3.5 w-40" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
      </div>

      {/* Payment + Usage grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment method */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="size-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-12 rounded" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-8 w-28" />
        </div>

        {/* Usage */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-4 w-16" />
          {[0, 1].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-20" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          ))}
          <div className="border-t border-border pt-3 space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3.5 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <Skeleton className="size-4" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="divide-y divide-border">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between px-6 py-3.5">
              <div className="space-y-1.5">
                <div className="flex items-baseline gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-3 w-28" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="size-6 rounded" />
                <Skeleton className="size-6 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
