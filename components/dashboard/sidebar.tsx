"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Home, MessageCircle, Mic, BookOpen, Layers, SpellCheck,
  AudioLines, PenLine, Headphones, TrendingUp, Award,
  Settings, CreditCard, X, Menu, Zap, ChevronRight, Theater, Flame,
} from "lucide-react";
import { routes } from "@/config/site";
import { Logo } from "@/components/marketing/logo";
import { cn } from "@/lib/utils";

/* ── Nav structure ───────────────────────────────────────────────── */

type NavItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean };
type NavSection = { label: string | null; items: NavItem[] };

const NAV_SECTIONS: NavSection[] = [
  {
    label: null,
    items: [
      { label: "Home", href: routes.dashboard, icon: Home, exact: true },
    ],
  },
  {
    label: "Learn",
    items: [
      { label: "AI Chat",       href: routes.chat,          icon: MessageCircle },
      { label: "Voice",         href: routes.voice,         icon: Mic },
      { label: "Lessons",       href: routes.lessons,       icon: BookOpen },
      { label: "Vocabulary",    href: routes.vocabulary,    icon: Layers },
      { label: "Grammar",       href: routes.grammar,       icon: SpellCheck },
      { label: "Pronunciation", href: routes.pronunciation, icon: AudioLines },
      { label: "Writing",       href: routes.writing,       icon: PenLine },
      { label: "Listening",     href: routes.listening,     icon: Headphones },
      { label: "Roleplay",      href: routes.roleplay,      icon: Theater },
      { label: "Debate",        href: routes.debate,        icon: Flame },
    ],
  },
  {
    label: "Progress",
    items: [
      { label: "Progress",     href: routes.progress,     icon: TrendingUp },
      { label: "Achievements", href: routes.achievements, icon: Award },
    ],
  },
];

const BOTTOM_NAV = [
  { label: "Settings", href: routes.settings, icon: Settings },
  { label: "Billing",  href: routes.billing,  icon: CreditCard },
];

/* ── NavItem ─────────────────────────────────────────────────────── */

function NavItem({
  href, label, icon: Icon, active, onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
        active
          ? "bg-primary/10 text-primary"
          : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
      )}
    >
      <Icon
        className={cn(
          "size-[17px] shrink-0 transition-opacity",
          active ? "opacity-100 text-primary" : "opacity-50 group-hover:opacity-75",
        )}
      />
      <span className="flex-1 truncate">{label}</span>
      {active && <ChevronRight className="size-3 opacity-40" />}
    </Link>
  );
}

/* ── SidebarContent ──────────────────────────────────────────────── */

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-5">
        <Logo />
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} className="space-y-0.5">
            {section.label && (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={active}
                  onClick={onNav}
                />
              );
            })}
          </div>
        ))}
      </nav>

      {/* Upgrade nudge */}
      <div className="px-3 pb-3">
        <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/15">
              <Zap className="size-3 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground leading-tight">Upgrade to Pro</p>
              <p className="text-[11px] text-muted-foreground leading-tight">Unlimited AI &amp; voice</p>
            </div>
          </div>
          <Link
            href={routes.pricing}
            className="flex w-full items-center justify-center rounded-lg bg-primary py-1.5 text-[11px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            View plans
          </Link>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="border-t border-[var(--sidebar-border)] px-3 py-3 space-y-0.5">
        {BOTTOM_NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={active}
              onClick={onNav}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ── Desktop Sidebar ─────────────────────────────────────────────── */

export function Sidebar() {
  return (
    <aside className="max-lg:hidden flex w-60 shrink-0 flex-col fixed inset-y-0 left-0 z-30 border-r border-[var(--sidebar-border)] bg-[var(--sidebar)]">
      <SidebarContent />
    </aside>
  );
}

/* ── Mobile Sidebar ──────────────────────────────────────────────── */

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center justify-center size-9 rounded-xl hover:bg-muted transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>

      {mounted && createPortal(
        <>
          <div
            className={cn(
              "fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 lg:hidden",
              open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
            )}
            onClick={() => setOpen(false)}
          />
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border shadow-xl transform transition-transform duration-200 ease-out lg:hidden",
              open ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
            >
              <X className="size-4" />
            </button>
            <SidebarContent onNav={() => setOpen(false)} />
          </div>
        </>,
        document.body,
      )}
    </>
  );
}
