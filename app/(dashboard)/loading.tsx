import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardGroupLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="rounded-2xl h-32" />
        ))}
      </div>
    </div>
  );
}
