import Link from "next/link";
import { cn } from "@/lib/utils";
import { routes } from "@/config/site";
import { siteConfig } from "@/config/site";

/**
 * Brand wordmark — a gradient orb mark + the Fluentra name. Links home.
 * `aria-label` keeps it a single, screen-reader-friendly link.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href={routes.home}
      aria-label={`${siteConfig.name} home`}
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <span
        aria-hidden
        className="relative grid size-8 place-items-center overflow-hidden rounded-[10px] bg-brand-gradient shadow-glow"
      >
        <span className="absolute inset-0 opacity-60 blur-md bg-brand-gradient" />
        <span className="relative size-3 rounded-full bg-white/90 shadow-sm transition-transform duration-300 group-hover:scale-110" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">{siteConfig.name}</span>
    </Link>
  );
}
