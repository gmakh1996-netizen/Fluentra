import Link from "next/link";
import { Sparkles, Play, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { routes } from "@/config/site";
import { HeroVisual } from "@/components/marketing/hero-visual";

const microPoints = ["No credit card", "Free forever plan", "Cancel anytime"];

export function Hero() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-heading">
      {/* Backdrop wash + grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] size-[60rem] max-w-none -translate-x-1/2 rounded-full bg-brand-gradient opacity-[0.10] blur-3xl dark:opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,var(--background))]" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="text-center lg:text-left">
          <Reveal preset="fade-up">
            <Link
              href={routes.features}
              className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-sm font-medium shadow-xs transition-colors hover:bg-secondary"
            >
              <Sparkles className="size-3.5 text-primary" />
              Powered by next-gen conversational AI
            </Link>
          </Reveal>

          <Reveal preset="fade-up" delay={0.05}>
            <h1
              id="hero-heading"
              className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
            >
              Learn languages with your{" "}
              <span className="text-gradient">personal AI tutor</span>
            </h1>
          </Reveal>

          <Reveal preset="fade-up" delay={0.1}>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground lg:mx-0">
              Hold real conversations by voice, get instant pronunciation and grammar feedback,
              and follow adaptive daily lessons that adjust to you. Fluency, finally made
              practical.
            </p>
          </Reveal>

          <Reveal preset="fade-up" delay={0.15}>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Button size="xl" variant="gradient" asChild className="w-full sm:w-auto">
                <Link href={routes.register}>
                  <Sparkles /> Start learning free
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild className="w-full sm:w-auto">
                <Link href={`${routes.features}#demo`}>
                  <Play /> Watch demo
                </Link>
              </Button>
            </div>
          </Reveal>

          <Reveal preset="fade" delay={0.2}>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground lg:justify-start">
              {microPoints.map((p) => (
                <li key={p} className="flex items-center gap-1.5">
                  <Check className="size-4 text-success" /> {p}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal preset="scale" delay={0.1} className="lg:pl-6">
          <HeroVisual />
        </Reveal>
      </div>
    </section>
  );
}
