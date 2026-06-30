import type { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog — Fluentra",
  description:
    "Language learning tips, AI technology insights, and fluency strategies from the Fluentra team.",
};

type Post = {
  slug: string;
  tag: string;
  tagColor: string;
  title: string;
  excerpt: string;
  author: string;
  authorInitials: string;
  date: string;
  readTime: string;
  featured?: boolean;
};

const POSTS: Post[] = [
  {
    slug: "how-ai-tutors-beat-traditional-apps",
    tag: "AI & Learning",
    tagColor: "bg-primary/10 text-primary",
    title: "Why AI Tutors Outperform Traditional Language Apps",
    excerpt:
      "Vocabulary drills have their place, but fluency comes from real conversation. We break down the science behind adaptive AI dialogue and why it transfers to real-world speaking faster than any flashcard deck.",
    author: "Mariam Kapanadze",
    authorInitials: "MK",
    date: "Jun 24, 2026",
    readTime: "6 min read",
    featured: true,
  },
  {
    slug: "pronunciation-scoring-explained",
    tag: "Pronunciation",
    tagColor: "bg-brand-cyan/10 text-brand-cyan",
    title: "How Pronunciation Scoring Actually Works",
    excerpt:
      "Accuracy, fluency, completeness — three scores, one microphone tap. We explain the acoustic model behind Fluentra's per-syllable feedback and what each number really means for your spoken English.",
    author: "Luca Romano",
    authorInitials: "LR",
    date: "Jun 17, 2026",
    readTime: "5 min read",
  },
  {
    slug: "streak-science-habit-formation",
    tag: "Habit & Motivation",
    tagColor: "bg-accent/10 text-accent",
    title: "The Psychology of Streaks: Why Consistency Beats Intensity",
    excerpt:
      "Research shows that 15 minutes every day beats two hours on Sunday. We dig into the habit-formation loops Fluentra uses — streaks, XP, and daily missions — and why they work where willpower alone fails.",
    author: "Sofia Marchetti",
    authorInitials: "SM",
    date: "Jun 10, 2026",
    readTime: "4 min read",
  },
  {
    slug: "writing-coach-business-english",
    tag: "Writing",
    tagColor: "bg-primary/10 text-primary",
    title: "From Good to Confident: Using the Writing Coach for Business English",
    excerpt:
      "Emails, proposals, Slack messages — professional English is its own dialect. Learn how to use Fluentra's tone-rewrite feature to shift between formal, friendly, and assertive in seconds.",
    author: "Aiko Tanaka",
    authorInitials: "AT",
    date: "Jun 3, 2026",
    readTime: "5 min read",
  },
  {
    slug: "listening-comprehension-tips",
    tag: "Listening",
    tagColor: "bg-brand-cyan/10 text-brand-cyan",
    title: "5 Listening Habits That Accelerate Comprehension",
    excerpt:
      "Most learners skip listening practice until they 'feel ready'. That's backwards. Here are five evidence-based habits — including how to use Fluentra's AI mini-podcasts — to train your ear from day one.",
    author: "Daniel Okafor",
    authorInitials: "DO",
    date: "May 27, 2026",
    readTime: "4 min read",
  },
  {
    slug: "100-languages-how-we-built-it",
    tag: "Behind the product",
    tagColor: "bg-accent/10 text-accent",
    title: "100 Languages: How We Built Multilingual AI at Scale",
    excerpt:
      "Supporting Georgian, Arabic, and Korean alongside Spanish and Mandarin isn't just a content problem — it's a model alignment, tone, and cultural nuance challenge. Here's what we learned.",
    author: "Elena Vasquez",
    authorInitials: "EV",
    date: "May 20, 2026",
    readTime: "7 min read",
  },
];

const TAGS = ["All", "AI & Learning", "Pronunciation", "Habit & Motivation", "Writing", "Listening", "Behind the product"];

export default function BlogPage() {
  const featured = POSTS.find((p) => p.featured)!;
  const rest = POSTS.filter((p) => !p.featured);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 via-background to-background py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <Reveal preset="fade-up">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              Fluentra Blog
            </p>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Learn smarter,{" "}
              <span className="text-primary">speak faster</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Language learning tips, AI insights, and fluency strategies from the Fluentra team.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

        {/* Tag filter — visual only */}
        <Reveal preset="fade-up">
          <div className="mb-10 flex flex-wrap gap-2">
            {TAGS.map((tag, i) => (
              <span
                key={tag}
                className={cn(
                  "cursor-default rounded-full border px-3.5 py-1 text-sm font-medium transition-colors",
                  i === 0
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground",
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        </Reveal>

        {/* Featured post */}
        <Reveal preset="fade-up">
          <Card className="group mb-10 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="grid gap-0 lg:grid-cols-2">
              {/* Decorative visual panel */}
              <div className="flex min-h-52 items-center justify-center bg-gradient-to-br from-primary/20 via-primary/5 to-background p-8 lg:min-h-64">
                <div className="space-y-3 text-center">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <span className="text-3xl font-bold">AI</span>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    Featured
                  </p>
                </div>
              </div>
              <CardHeader className="justify-center p-8">
                <div className="mb-3 flex items-center gap-3">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", featured.tagColor)}>
                    {featured.tag}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" /> {featured.readTime}
                  </span>
                </div>
                <CardTitle className="text-2xl leading-snug">{featured.title}</CardTitle>
                <CardDescription className="mt-2 leading-relaxed">{featured.excerpt}</CardDescription>
                <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="grid size-7 place-items-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                    {featured.authorInitials}
                  </span>
                  {featured.author} · {featured.date}
                </div>
              </CardHeader>
            </div>
          </Card>
        </Reveal>

        {/* Post grid */}
        <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <Reveal key={post.slug} preset="fade-up">
              <Card className="group flex h-full flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <CardHeader className="flex-1">
                  <div className="mb-3 flex items-center gap-3">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", post.tagColor)}>
                      {post.tag}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" /> {post.readTime}
                    </span>
                  </div>
                  <CardTitle className="text-lg leading-snug">{post.title}</CardTitle>
                  <CardDescription className="mt-1.5 leading-relaxed">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="grid size-6 place-items-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                      {post.authorInitials}
                    </span>
                    {post.author} · {post.date}
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </RevealGroup>

        {/* Newsletter CTA */}
        <Reveal preset="fade-up">
          <div className="mt-16 rounded-2xl bg-primary/5 p-8 text-center ring-1 ring-border">
            <h2 className="font-display text-2xl font-bold">Never miss a post</h2>
            <p className="mt-2 text-muted-foreground">
              Get language tips and Fluentra updates straight to your inbox. No spam, unsubscribe any time.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <input
                type="email"
                placeholder="you@email.com"
                className="w-full max-w-xs rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none ring-primary focus:ring-2 sm:w-auto"
              />
              <Button>Subscribe</Button>
            </div>
          </div>
        </Reveal>
      </div>
    </>
  );
}
