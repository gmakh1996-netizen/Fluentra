import { requireUserPage } from "@/lib/auth";
import { Logo } from "@/components/marketing/logo";
import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/auth/user-nav";

/**
 * Protected app shell. `requireUserPage` redirects signed-out users to login
 * (middleware also gates these paths). The full sidebar shell is built in the
 * dashboard phase — this provides the auth boundary + account menu meanwhile.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireUserPage();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <div className="flex items-center gap-2">
            <ModeToggle />
            <UserNav
              email={user.email ?? ""}
              displayName={profile?.display_name}
              avatarUrl={profile?.avatar_url}
              role={profile?.role}
            />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
