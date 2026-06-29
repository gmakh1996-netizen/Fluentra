import { Star, Quote } from "lucide-react";
import { testimonials } from "@/content/landing";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";

function Stars() {
  return (
    <div className="flex gap-0.5" aria-label="Rated 5 out of 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="size-4 fill-warning text-warning" aria-hidden />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="border-y bg-muted/30"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHeading
          eyebrow="Loved by learners"
          title={<span id="testimonials-heading">People who actually started speaking</span>}
          subtitle="Real stories from learners who broke through the plateau with daily AI practice."
        />

        <RevealGroup
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.06}
        >
          {testimonials.map((t) => (
            <Reveal key={t.name} preset="fade-up">
              <Card className="relative h-full transition-shadow duration-300 hover:shadow-md">
                <CardContent className="flex h-full flex-col gap-4">
                  <Quote aria-hidden className="size-7 text-primary/30" />
                  <Stars />
                  <p className="flex-1 text-sm leading-relaxed text-foreground/90">“{t.quote}”</p>
                  <div className="flex items-center gap-3 border-t pt-4">
                    <Avatar>
                      <AvatarFallback className="bg-brand-gradient text-xs text-white">
                        {t.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="leading-tight">
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.role} · {t.language}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
