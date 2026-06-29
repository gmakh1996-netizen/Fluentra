import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { UsersTable } from "@/components/admin/users-table";
import type { AdminUser } from "@/components/admin/users-table";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const admin = createAdminClient();

  const [authResult, { data: profiles }, { data: subs }] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 500 }),
    admin.from("profiles").select("id, display_name, role, subscription_tier"),
    admin.from("subscriptions").select("user_id, status"),
  ]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const subMap     = new Map((subs     ?? []).map((s) => [s.user_id, s]));

  const users: AdminUser[] = (authResult.data?.users ?? []).map((u) => ({
    id:           u.id,
    email:        u.email ?? "",
    display_name: profileMap.get(u.id)?.display_name ?? null,
    role:         (profileMap.get(u.id)?.role ?? "user") as "user" | "admin",
    tier:         profileMap.get(u.id)?.subscription_tier ?? "free",
    joined:       u.created_at,
    last_sign_in: u.last_sign_in_at ?? null,
    sub_status:   subMap.get(u.id)?.status ?? "inactive",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {users.length} registered account{users.length !== 1 ? "s" : ""}
        </p>
      </div>
      <UsersTable initialUsers={users} />
    </div>
  );
}
