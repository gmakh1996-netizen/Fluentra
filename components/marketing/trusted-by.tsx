import { trustMarks } from "@/content/landing";
import { Reveal } from "@/components/ui/reveal";

/**
 * Social-proof strip. Uses tasteful, original text marks (not copyrighted
 * logos) rendered in muted grayscale so they read as "trusted by" without
 * pulling focus from the hero.
 */
export function TrustedBy() {
  return (
    <section aria-label="Trusted by teams worldwide" className="border-y bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Reveal preset="fade">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Trusted by curious minds at forward-thinking teams
          </p>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60 grayscale">
            {trustMarks.map((mark) => (
              <li
                key={mark}
                className="font-display text-lg font-bold tracking-tight text-foreground"
              >
                {mark}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
