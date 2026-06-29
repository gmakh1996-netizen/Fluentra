"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { allLanguages, REGIONS, type Region } from "@/content/languages";
import { routes } from "@/config/site";
import { cn } from "@/lib/utils";

export default function LanguagesPage() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<Region | "All">("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allLanguages.filter((l) => {
      const matchesRegion = region === "All" || l.region === region;
      const matchesQuery =
        !q || l.name.toLowerCase().includes(q) || l.native.toLowerCase().includes(q);
      return matchesRegion && matchesQuery;
    });
  }, [query, region]);

  const grouped = useMemo(() => {
    if (region !== "All") return { [region]: filtered };
    return REGIONS.reduce<Partial<Record<Region, typeof allLanguages>>>((acc, r) => {
      const langs = filtered.filter((l) => l.region === r);
      if (langs.length) acc[r] = langs;
      return acc;
    }, {});
  }, [filtered, region]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          100+ languages
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          One AI tutor, every language
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          From global staples like Spanish and Mandarin to languages most apps overlook — Georgian,
          Swahili, Quechua and beyond.
        </p>
      </div>

      {/* Search + filter */}
      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search languages…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Region pills */}
        <div className="flex flex-wrap gap-2">
          {(["All", ...REGIONS] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                region === r
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="mt-4 text-sm text-muted-foreground">
        {filtered.length === allLanguages.length
          ? `All ${allLanguages.length} languages`
          : `${filtered.length} of ${allLanguages.length} languages`}
      </p>

      {/* Language grid — grouped by region */}
      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground">
          No languages match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="mt-8 space-y-12">
          {(Object.entries(grouped) as [Region, typeof allLanguages][]).map(([r, langs]) => (
            <section key={r} aria-labelledby={`region-${r}`}>
              {region === "All" && (
                <h2
                  id={`region-${r}`}
                  className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  {r}
                </h2>
              )}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {langs.map((lang) => (
                  <div
                    key={lang.name}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl border bg-card px-4 py-3.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
                      lang.featured && "border-primary/20",
                    )}
                  >
                    <span className="text-2xl" aria-hidden>
                      {lang.flag}
                    </span>
                    <div className="min-w-0 leading-tight">
                      <p className="truncate text-sm font-semibold">{lang.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{lang.native}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-10 text-center">
        <h2 className="font-display text-2xl font-bold">Ready to start?</h2>
        <p className="mt-2 text-muted-foreground">
          Pick your language, set your goal, and have your first conversation today.
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
