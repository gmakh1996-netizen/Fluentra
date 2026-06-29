import { steps } from "@/content/landing";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";

export function HowItWorks() {
  return (
    <section
      aria-labelledby="how-heading"
      className="border-y bg-muted/30"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHeading
          eyebrow="How it works"
          title={<span id="how-heading">Fluent in four simple steps</span>}
          subtitle="No overwhelming menus. Just a clear path from your first hello to real conversations."
        />

        <RevealGroup className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connecting line on desktop */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
          />
          {steps.map((s) => (
            <Reveal key={s.step} preset="fade-up" className="relative text-center">
              <div className="relative z-10 mx-auto grid size-14 place-items-center rounded-2xl bg-brand-gradient font-display text-lg font-bold text-white shadow-glow">
                {s.step}
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
            </Reveal>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
