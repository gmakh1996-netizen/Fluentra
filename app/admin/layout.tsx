import { requireAdminPage } from "@/lib/auth";
import { Logo } from "@/components/marketing/logo";
import { ModeToggle } from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { UserNav } from "@/components/auth/user-nav";

/**
 * Admin-only shell. `requireAdminPage` enforces the `admin` role server-side
 * (redirecting non-admins to the dashboard) — the role is checked against the
 * DB via RLS, not inferred from the client. Full admin tooling ships in the
 * admin phase.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireAdminPage();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Logo />
            <Badge variant="gradient">Admin</Badge>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <UserNav
              email={user.email ?? ""}
              displayName={profile.display_name}
              avatarUrl={profile.avatar_url}
              role={profile.role}
            />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
