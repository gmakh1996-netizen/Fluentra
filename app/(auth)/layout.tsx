import Link from "next/link";
import { ArrowLeft, Sparkles, Check } from "lucide-react";
import { routes, siteConfig } from "@/config/site";
import { Logo } from "@/components/marketing/logo";
import { ModeToggle } from "@/components/mode-toggle";

const highlights = [
  "Real conversations with an AI tutor that adapts to you",
  "Instant pronunciation, grammar and writing feedback",
  "100+ languages, adaptive daily lessons, gamified streaks",
];

/** Premium split layout: brand story on the left, the auth form on the right. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand-gradient p-12 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_55%)]"
        />
        <div className="relative flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-[10px] bg-white/20 backdrop-blur">
            <Sparkles className="size-4" />
          </span>
          <span className="font-display text-lg font-bold">{siteConfig.name}</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="font-display text-3xl font-bold leading-tight">
            Speak the world with AI.
          </h2>
          <ul className="mt-8 space-y-4">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-white/90">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white/20">
                  <Check className="size-3" />
                </span>
                {h}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/70">
          Join millions learning faster with their personal AI tutor.
        </p>
      </aside>

      {/* Form panel */}
      <div className="flex flex-col">
        <header className="flex items-center justify-between p-4 sm:p-6">
          <Link
            href={routes.home}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to home
          </Link>
          <ModeToggle />
        </header>

        <main className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-6">
          <div className="w-full max-w-md">
            <div className="mb-8 flex justify-center lg:hidden">
              <Logo />
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
