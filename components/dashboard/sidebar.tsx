"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Home, MessageCircle, Mic, BookOpen, Layers, SpellCheck,
  AudioLines, PenLine, Headphones, TrendingUp, Award,
  Settings, CreditCard, X, Menu, Zap, ChevronRight,
} from "lucide-react";
import { dashboardNav, routes } from "@/config/site";
import { Logo } from "@/components/marketing/logo";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "home": Home,
  "message-circle": MessageCircle,
  "mic": Mic,
  "book-open": BookOpen,
  "layers": Layers,
  "spell-check": SpellCheck,
  "audio-lines": AudioLines,
  "pen-line": PenLine,
  "headphones": Headphones,
  "trending-up": TrendingUp,
  "award": Award,
};

const BOTTOM_NAV = [
  { label: "Settings", href: routes.settings, icon: Settings },
  { label: "Billing", href: routes.billing, icon: CreditCard },
];

function NavItem({
  href, label, icon: Icon, active, onClick,
}: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
      )}
    >
      <Icon className={cn("size-4 shrink-0", active ? "opacity-100" : "opacity-60 group-hover:opacity-80")} />
      <span className="flex-1 truncate">{label}</span>
      {active && <ChevronRight className="size-3 opacity-60" />}
    </Link>
  );
}

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center px-4 shrink-0">
        <Logo />
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {dashboardNav.map((item) => {
          const Icon = ICON_MAP[item.icon] ?? Home;
          const active = item.href === "/dashboard"
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <NavItem key={item.href} href={item.href} label={item.label} icon={Icon} active={active} onClick={onNav} />
          );
        })}
      </nav>

      {/* Upgrade nudge */}
      <div className="px-3 pb-3">
        <div className="relative overflow-hidden rounded-xl bg-primary/10 p-3">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/20">
              <Zap className="size-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-primary">Upgrade to Pro</p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-snug">Unlock unlimited AI, voice & lessons</p>
            </div>
          </div>
          <Link
            href={routes.billing}
            className="mt-2.5 flex w-full items-center justify-center rounded-lg bg-primary py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
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
            <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} active={active} onClick={onNav} />
          );
        })}
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="max-lg:hidden flex w-60 shrink-0 flex-col fixed inset-y-0 left-0 z-30 border-r border-[var(--sidebar-border)] bg-[var(--sidebar)]">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      {/* Hamburger button — stays inside the header */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center justify-center size-9 rounded-xl hover:bg-muted transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>

      {/* Portal to body so header's backdrop-filter doesn't confine fixed positioning */}
      {mounted && createPortal(
        <>
          {/* Overlay */}
          <div
            className={cn(
              "fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 lg:hidden",
              open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
            )}
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border shadow-xl transform transition-transform duration-200 ease-out lg:hidden",
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
