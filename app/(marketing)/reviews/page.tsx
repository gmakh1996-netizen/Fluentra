"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Star, ArrowRight, Quote } from "lucide-react";
import { routes } from "@/config/site";
import { cn } from "@/lib/utils";

interface Review {
  quote: string;
  name: string;
  role: string;
  initials: string;
  language: string;
  rating: number;
  date: string;
}

const ALL_REVIEWS: Review[] = [
  {
    quote: "I went from freezing up in meetings to leading them in English. Talking to the AI every morning killed the fear of speaking — it's the part no app ever solved for me.",
    name: "Mariam Kapanadze", role: "Product Manager", initials: "MK",
    language: "English", rating: 5, date: "December 2024",
  },
  {
    quote: "The pronunciation scoring is uncanny. It caught the exact sounds I was getting wrong in Japanese and showed me how to fix them. Three months in and locals understand me.",
    name: "Luca Romano", role: "Software Engineer", initials: "LR",
    language: "Japanese", rating: 5, date: "November 2024",
  },
  {
    quote: "As a teacher I'm picky about pedagogy. Fluentra's feedback is genuinely good — corrections come with clear reasons, not just red lines. My French finally feels natural.",
    name: "Sofia Marchetti", role: "High-school Teacher", initials: "SM",
    language: "French", rating: 5, date: "November 2024",
  },
  {
    quote: "I tried the big names and got bored in a week. The daily missions and streaks are the only thing that's ever kept me coming back. 140-day streak and counting.",
    name: "Daniel Okafor", role: "Medical Student", initials: "DO",
    language: "German", rating: 5, date: "October 2024",
  },
  {
    quote: "The writing coach rewrote my cover letter in a confident tone and explained every change. I got the interview. Worth the subscription on that alone.",
    name: "Aiko Tanaka", role: "UX Designer", initials: "AT",
    language: "English", rating: 5, date: "October 2024",
  },
  {
    quote: "Switching between casual and business modes is brilliant. I prep for client calls in Spanish in ten minutes and walk in sounding like I belong there.",
    name: "Elena Vasquez", role: "Sales Lead", initials: "EV",
    language: "Spanish", rating: 5, date: "September 2024",
  },
  {
    quote: "I've been learning Korean for two years and Fluentra finally cracked the listening comprehension barrier for me. The AI adapts to my actual mistakes, not a generic syllabus.",
    name: "James Park", role: "Graphic Designer", initials: "JP",
    language: "Korean", rating: 5, date: "December 2024",
  },
  {
    quote: "Arabic script looked like art to me. Six months of daily sessions with Fluentra and I can actually read menus and street signs in Cairo. Incredible.",
    name: "Anna Bergström", role: "Travel Journalist", initials: "AB",
    language: "Arabic", rating: 5, date: "November 2024",
  },
  {
    quote: "The grammar explanations are better than my university textbook. Every correction comes with a 'why' and an example I can actually remember.",
    name: "Pedro Almeida", role: "Translator", initials: "PA",
    language: "German", rating: 5, date: "October 2024",
  },
  {
    quote: "I was skeptical about AI language learning but the voice conversation feature changed my mind. It's genuinely patient, never judges my mistakes, and pushes me just enough.",
    name: "Yuki Nakamura", role: "Architect", initials: "YN",
    language: "Spanish", rating: 4, date: "December 2024",
  },
  {
    quote: "My Chinese tones were a disaster. After two months Fluentra's pronunciation scoring finally got me from 'incomprehensible' to 'understood by actual people'. Progress.",
    name: "Oliver Schmidt", role: "Import/Export Manager", initials: "OS",
    language: "Chinese (Mandarin)", rating: 5, date: "November 2024",
  },
  {
    quote: "The business mode is perfect for interview prep. I rehearsed in French every morning for a week before my Paris interview and got the job. Recommended to my whole team.",
    name: "Claire Dubois", role: "Marketing Director", initials: "CD",
    language: "French", rating: 5, date: "September 2024",
  },
  {
    quote: "Georgian has almost no learning resources in English. Fluentra is genuinely one of the only tools that handles the script and grammar properly. Huge deal for our community.",
    name: "Giorgi Beridze", role: "PhD Student", initials: "GB",
    language: "Georgian", rating: 5, date: "October 2024",
  },
  {
    quote: "I use it 20 minutes a day on my commute. In four months my reading speed in Italian has doubled. The vocabulary drills are genuinely smarter than flashcards.",
    name: "Sven Eriksson", role: "Chef", initials: "SE",
    language: "Italian", rating: 4, date: "November 2024",
  },
  {
    quote: "The streak system is dangerous — I haven't missed a day in 90 days. My Turkish is nowhere near fluent but I've learned more in three months than the previous two years combined.",
    name: "Mia Johnson", role: "Nurse", initials: "MJ",
    language: "Turkish", rating: 5, date: "December 2024",
  },
  {
    quote: "I needed Portuguese for a relocation to Lisbon. I went from zero to conversational in five months using Fluentra daily. My new colleagues were genuinely surprised.",
    name: "Chris O'Brien", role: "Software Developer", initials: "CO",
    language: "Portuguese", rating: 5, date: "August 2024",
  },
  {
    quote: "The explain feature for vocabulary is brilliant. I tap a word in any response and get the etymology, usage examples, and common mistakes. Like having a linguist on call.",
    name: "Priya Sharma", role: "Content Strategist", initials: "PS",
    language: "French", rating: 5, date: "September 2024",
  },
  {
    quote: "Finally a tool that takes Hindi seriously as a literary language, not just a tourist phrase tool. The formal register mode is something I haven't seen anywhere else.",
    name: "Rohan Mehta", role: "Film Director", initials: "RM",
    language: "Hindi", rating: 5, date: "October 2024",
  },
  {
    quote: "Voice mode is my favourite. I do 15-minute conversations in Russian while cooking dinner. My grammar is still rough but my confidence has completely transformed.",
    name: "Laura Nielsen", role: "Economist", initials: "LN",
    language: "Russian", rating: 4, date: "November 2024",
  },
  {
    quote: "The grammar panel mid-conversation is a game changer. I can check whether what I'm about to say is correct before I say it. Real-time coaching.",
    name: "Hana Suzuki", role: "Project Manager", initials: "HS",
    language: "English", rating: 5, date: "December 2024",
  },
];

const LANGUAGES = ["All", ...Array.from(new Set(ALL_REVIEWS.map((r) => r.language))).sort()];

const RATING_COUNTS = [5, 4, 3, 2, 1].map((star) => ({
  star,
  count: ALL_REVIEWS.filter((r) => r.rating === star).length,
}));

const AVG_RATING =
  ALL_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / ALL_REVIEWS.length;

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  return (
    <div className={cn("flex gap-0.5", size === "lg" ? "gap-1" : "")}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "fill-current",
            size === "lg" ? "size-6" : "size-3.5",
            i <= rating ? "text-amber-400" : "text-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [lang, setLang] = useState("All");

  const filtered = useMemo(
    () => (lang === "All" ? ALL_REVIEWS : ALL_REVIEWS.filter((r) => r.language === lang)),
    [lang],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Learner reviews
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          What our learners say
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Real stories from people who went from hesitant beginners to confident speakers.
        </p>
      </div>

      {/* Rating summary */}
      <div className="mx-auto mt-12 flex max-w-2xl flex-col items-center gap-6 rounded-2xl border bg-card p-8 sm:flex-row sm:gap-10">
        {/* Big score */}
        <div className="text-center">
          <p className="font-display text-6xl font-bold">{AVG_RATING.toFixed(1)}</p>
          <Stars rating={Math.round(AVG_RATING)} size="lg" />
          <p className="mt-1 text-sm text-muted-foreground">{ALL_REVIEWS.length} reviews</p>
        </div>
        {/* Bar breakdown */}
        <div className="flex w-full flex-col gap-1.5">
          {RATING_COUNTS.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-2 text-right text-muted-foreground">{star}</span>
              <Star className="size-3 fill-amber-400 text-amber-400" />
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all"
                  style={{ width: `${(count / ALL_REVIEWS.length) * 100}%` }}
                />
              </div>
              <span className="w-5 text-right text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Language filter */}
      <div className="mt-10 flex flex-wrap gap-2">
        {LANGUAGES.map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              lang === l
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
          >
            {l}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        {filtered.length === ALL_REVIEWS.length
          ? `All ${ALL_REVIEWS.length} reviews`
          : `${filtered.length} review${filtered.length !== 1 ? "s" : ""} for ${lang}`}
      </p>

      {/* Review grid */}
      <div className="mt-6 columns-1 gap-5 sm:columns-2 lg:columns-3">
        {filtered.map((review) => (
          <div
            key={review.name}
            className="mb-5 break-inside-avoid rounded-2xl border bg-card p-6 shadow-xs"
          >
            {/* Stars + date */}
            <div className="flex items-center justify-between">
              <Stars rating={review.rating} />
              <span className="text-xs text-muted-foreground">{review.date}</span>
            </div>

            {/* Quote */}
            <div className="relative mt-4">
              <Quote className="absolute -left-1 -top-1 size-5 text-primary/20" aria-hidden />
              <p className="pl-5 text-sm leading-relaxed text-foreground/90">{review.quote}</p>
            </div>

            {/* Author */}
            <div className="mt-5 flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {review.initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{review.name}</p>
                <p className="truncate text-xs text-muted-foreground">{review.role}</p>
              </div>
              <span className="ml-auto shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {review.language}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-10 text-center">
        <h2 className="font-display text-2xl font-bold">Add your story</h2>
        <p className="mt-2 text-muted-foreground">
          Start learning today and join thousands of confident speakers.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={routes.register}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            Get started free <ArrowRight className="size-4" />
          </Link>
          <Link
            href={routes.pricing}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-2.5 text-sm font-medium transition hover:bg-muted"
          >
            View pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
