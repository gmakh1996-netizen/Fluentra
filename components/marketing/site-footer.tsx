"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Twitter, Github, Linkedin, Instagram, Globe, ArrowRight } from "lucide-react";
import { routes, siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/marketing/logo";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

const footerNav = [
  {
    title: "Product",
    links: [
      { label: "Features", href: routes.features },
      { label: "Languages", href: routes.languages },
      { label: "Pricing", href: routes.pricing },
      { label: "Reviews", href: routes.reviews },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Blog", href: routes.blog },
      { label: "FAQ", href: routes.faq },
      { label: "Contact", href: routes.contact },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: routes.privacy },
      { label: "Terms of Service", href: routes.terms },
    ],
  },
] as const;

const socials = [
  { label: "X (Twitter)", href: "https://x.com", icon: Twitter },
  { label: "GitHub", href: "https://github.com", icon: Github },
  { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
] as const;

// next-intl is wired in a later phase; this is the UI-ready selector.
const LOCALES = [
  { code: "en", label: "English" },
  { code: "ka", label: "ქართული" },
] as const;

export function SiteFooter() {
  const [locale, setLocale] = React.useState<string>("en");

  function onSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = new FormData(form).get("email")?.toString().trim();
    if (!email) return;
    toast.success("You’re on the list!", { description: "Watch your inbox for learning tips." });
    form.reset();
  }

  return (
    <footer className="border-t bg-muted/30" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          {/* Brand + newsletter */}
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">{siteConfig.description}</p>

            <form onSubmit={onSubscribe} className="mt-6">
              <label htmlFor="newsletter-email" className="text-sm font-medium">
                Get weekly learning tips
              </label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-label="Email address"
                />
                <Button type="submit" variant="gradient" aria-label="Subscribe">
                  <ArrowRight />
                </Button>
              </div>
            </form>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerNav.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h3 className="text-sm font-semibold">{col.title}</h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {/* year set at build */}2026 {siteConfig.name}. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            {/* Language selector (UI-ready for next-intl) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={`Language: ${LOCALES.find((l) => l.code === locale)?.label}`}
                >
                  <Globe className="size-4" aria-hidden />
                  {LOCALES.find((l) => l.code === locale)?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={locale} onValueChange={setLocale}>
                  {LOCALES.map((l) => (
                    <DropdownMenuRadioItem key={l.code} value={l.code}>
                      {l.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <ul className="flex items-center gap-1">
              {socials.map((s) => (
                <li key={s.label}>
                  <Button variant="ghost" size="icon-sm" asChild>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                      <s.icon className="size-4" />
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
