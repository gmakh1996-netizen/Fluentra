import Link from "next/link";
import { faqs } from "@/content/landing";
import { routes } from "@/config/site";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";

export function Faq() {
  return (
    <section aria-labelledby="faq-heading" className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <SectionHeading
        eyebrow="FAQ"
        title={<span id="faq-heading">Questions, answered</span>}
        subtitle="Everything you need to know before you start. Still curious?"
      />

      <Reveal preset="fade-up" className="mt-12">
        <Accordion type="single" collapsible className="rounded-2xl border bg-card px-6 shadow-sm">
          {faqs.map((item, i) => (
            <AccordionItem key={item.question} value={`item-${i}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent className="leading-relaxed">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>

      <Reveal preset="fade" className="mt-8 text-center text-sm text-muted-foreground">
        Can’t find what you’re looking for?{" "}
        <Link href={routes.contact} className="font-medium text-primary hover:text-accent">
          Get in touch
        </Link>
      </Reveal>
    </section>
  );
}
