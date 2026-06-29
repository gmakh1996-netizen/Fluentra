import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { languages } from "@/content/landing";
import { routes } from "@/config/site";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";

export function Languages() {
  return (
    <section aria-labelledby="languages-heading" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <SectionHeading
        eyebrow="100+ languages"
        title={<span id="languages-heading">Learn the language you’ve always wanted</span>}
        subtitle="From global languages to ones most apps overlook — including Georgian, Arabic, Korean and more."
      />

      <RevealGroup className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {languages.map((lang) => (
          <Reveal key={lang.name} preset="scale">
            <div className="group flex items-center gap-3 rounded-xl border bg-card px-4 py-3.5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
              <span className="text-2xl" aria-hidden>
                {lang.flag}
              </span>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-semibold">{lang.name}</p>
                <p className="truncate text-xs text-muted-foreground">{lang.native}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </RevealGroup>

      <Reveal preset="fade" className="mt-10 text-center">
        <Link
          href={routes.languages}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
        >
          Explore all languages <ArrowRight className="size-4" />
        </Link>
      </Reveal>
    </section>
  );
}
