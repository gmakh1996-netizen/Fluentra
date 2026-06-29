import { cn } from "@/lib/utils";

/**
 * Loading placeholder. Uses the shimmer utility (defined in globals.css) for a
 * premium sweep instead of a flat pulse. Match the size/shape of the content
 * it stands in for.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("shimmer animate-shimmer rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
