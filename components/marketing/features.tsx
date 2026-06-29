import {
  MessagesSquare,
  AudioLines,
  SpellCheck,
  PenLine,
  Headphones,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { features, type IconKey } from "@/content/landing";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import { cn } from "@/lib/utils";

const ICONS: Record<IconKey, LucideIcon> = {
  "messages-square": MessagesSquare,
  "audio-lines": AudioLines,
  "spell-check": SpellCheck,
  "pen-line": PenLine,
  headphones: Headphones,
  trophy: Trophy,
};

const ACCENT: Record<string, string> = {
  primary: "from-primary/15 text-primary",
  accent: "from-accent/15 text-accent",
  cyan: "from-brand-cyan/15 text-brand-cyan",
};

export function Features() {
  return (
    <section id="features" aria-labelledby="features-heading" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <SectionHeading
        eyebrow="Everything you need"
        title={<span id="features-heading">One platform, every way to learn</span>}
        subtitle="Conversation, pronunciation, grammar, writing and listening — all in one tutor that adapts to your level and your goals."
      />

      <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => {
          const Icon = ICONS[f.icon];
          return (
            <Reveal key={f.title} preset="fade-up">
              <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <CardHeader>
                  <span
                    className={cn(
                      "mb-4 grid size-12 place-items-center rounded-xl bg-gradient-to-br to-transparent ring-1 ring-inset ring-border transition-transform duration-300 group-hover:scale-110",
                      ACCENT[f.accent],
                    )}
                  >
                    <Icon className="size-6" />
                  </span>
                  <CardTitle>{f.title}</CardTitle>
                  <CardDescription className="leading-relaxed">{f.description}</CardDescription>
                </CardHeader>
              </Card>
            </Reveal>
          );
        })}
      </RevealGroup>
    </section>
  );
}
