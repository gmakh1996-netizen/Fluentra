import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { AdminSidebar, MobileAdminSidebar } from "@/components/admin/admin-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/auth/user-nav";

export const metadata: Metadata = {
  title: { template: "%s — Fluentra Admin", default: "Admin" },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireAdminPage();

  return (
    <div className="flex min-h-dvh">
      <AdminSidebar />
      <div className="flex flex-1 flex-col lg:pl-60">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/80 backdrop-blur px-4 lg:hidden">
          <MobileAdminSidebar />
          <span className="flex-1 text-sm font-semibold">Admin</span>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <UserNav
              email={user.email ?? ""}
              displayName={profile.display_name}
              avatarUrl={profile.avatar_url}
              role={profile.role}
            />
          </div>
        </header>

        {/* Desktop header */}
        <header className="sticky top-0 z-30 hidden h-14 items-center justify-between border-b bg-card/80 backdrop-blur px-6 lg:flex">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Admin Panel
          </span>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <UserNav
              email={user.email ?? ""}
              displayName={profile.display_name}
              avatarUrl={profile.avatar_url}
              role={profile.role}
            />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
