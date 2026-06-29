import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { routes } from "@/config/site";

/** Closing conversion band — full-bleed brand gradient with a clear CTA. */
export function CtaBand() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal preset="scale">
        <div className="bg-brand-gradient-animated animate-gradient relative overflow-hidden rounded-3xl px-6 py-16 text-center shadow-glow sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_60%)]"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Your next language starts with a single conversation
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">
              Join millions learning faster with a tutor that listens, corrects and adapts —
              available the moment inspiration strikes.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="xl" variant="secondary" asChild className="w-full sm:w-auto">
                <Link href={routes.register}>
                  <Sparkles /> Start learning free
                </Link>
              </Button>
              <Button
                size="xl"
                asChild
                className="w-full border border-white/40 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
              >
                <Link href={routes.pricing}>View pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
