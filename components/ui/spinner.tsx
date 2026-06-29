import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Indeterminate loading spinner. Honors reduced-motion (the global rule
 * neutralizes the spin). Provide an accessible label via `aria-label` when used
 * standalone; decorative when paired with adjacent text.
 */
function Spinner({
  className,
  label,
  ...props
}: React.ComponentProps<"svg"> & { label?: string }) {
  return (
    <Loader2
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("size-4 animate-spin text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Spinner };
