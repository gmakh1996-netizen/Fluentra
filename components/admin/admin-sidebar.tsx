"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, CreditCard, Zap, FileText,
  MessageSquare, Layers, X, Menu, ChevronRight, ShieldCheck, ArrowLeft,
} from "lucide-react";
import { Logo } from "@/components/marketing/logo";
import { routes } from "@/config/site";
import { cn } from "@/lib/utils";

const ADMIN_NAV: { label: string; href: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean }[] = [
  { label: "Overview",      href: "/admin",               icon: LayoutDashboard, exact: true },
  { label: "Users",         href: "/admin/users",         icon: Users },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { label: "AI Usage",      href: "/admin/ai-usage",      icon: Zap },
  { label: "Reports",       href: "/admin/reports",       icon: FileText },
  { label: "Support",       href: "/admin/support",       icon: MessageSquare },
  { label: "Content / CMS", href: "/admin/content",       icon: Layers },
];

function NavItem({
  href, label, icon: Icon, active, onClick,
}: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
        active
          ? "bg-violet-600 text-white shadow-sm"
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
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-[var(--sidebar-border)] px-4">
        <Logo />
        <span className="rounded-full bg-violet-600/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
          Admin
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {ADMIN_NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} active={active} onClick={onNav} />
          );
        })}
      </nav>

      <div className="border-t border-[var(--sidebar-border)] px-3 py-4 space-y-2">
        <Link
          href={routes.dashboard}
          onClick={onNav}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>
        <div className="flex items-center gap-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 p-3 text-xs text-violet-700 dark:text-violet-300">
          <ShieldCheck className="size-4 shrink-0" />
          Admin access only
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col fixed inset-y-0 left-0 z-30 border-r border-[var(--sidebar-border)] bg-[var(--sidebar)]">
      <SidebarContent />
    </aside>
  );
}

export function MobileAdminSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center size-9 rounded-xl hover:bg-muted transition-colors"
        aria-label="Open admin menu"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] transform transition-transform duration-200 ease-out",
        open ? "translate-x-0" : "-translate-x-full",
      )}>
        <button
          onClick={() => setOpen(false)}
          className="absolute right-3 top-4 flex size-8 items-center justify-center rounded-lg hover:bg-muted"
        >
          <X className="size-4" />
        </button>
        <SidebarContent onNav={() => setOpen(false)} />
      </div>
    </>
  );
}
