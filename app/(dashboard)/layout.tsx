import { requireUserPage } from "@/lib/auth";
import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/auth/user-nav";
import { Sidebar, MobileSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireUserPage();

  return (
    <div className="flex min-h-dvh bg-[var(--background)]">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content — offset by sidebar width on lg */}
      <div className="flex flex-1 flex-col lg:pl-60">
        {/* Mobile / top header */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-[var(--background)]/80 px-4 backdrop-blur-md sm:px-6">
          <MobileSidebar />
          <div className="flex-1" />
          <ModeToggle />
          <UserNav
            email={user.email ?? ""}
            displayName={profile?.display_name}
            avatarUrl={profile?.avatar_url}
            role={profile?.role}
          />
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
