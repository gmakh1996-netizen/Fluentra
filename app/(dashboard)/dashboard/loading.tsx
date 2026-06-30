import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Greeting */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-44" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-8 w-36 rounded-lg" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="size-8 rounded-xl" />
            </div>
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Goal + Weekly */}
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="rounded-2xl h-44" />
        <Skeleton className="md:col-span-2 rounded-2xl h-44" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="rounded-2xl h-20" />
        ))}
      </div>

      {/* Recommendations + Activity */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-3">
          <Skeleton className="h-4 w-40" />
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="rounded-2xl h-24" />
          ))}
        </div>
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="rounded-2xl h-52" />
          <Skeleton className="rounded-2xl h-44" />
        </div>
      </div>
    </div>
  );
}
