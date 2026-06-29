"use client";

import { useState, useTransition } from "react";
import { Search, Shield, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminUser = {
  id: string;
  email: string;
  display_name: string | null;
  role: "user" | "admin";
  tier: string;
  joined: string;
  last_sign_in: string | null;
  sub_status: string;
};

const TIER_CLS: Record<string, string> = {
  free:     "text-muted-foreground bg-muted",
  pro:      "text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300",
  ultimate: "text-violet-700 bg-violet-50 dark:bg-violet-950/40 dark:text-violet-300",
};
const STATUS_CLS: Record<string, string> = {
  active:   "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300",
  trialing: "text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300",
  past_due: "text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300",
  canceled: "text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300",
  inactive: "text-muted-foreground bg-muted",
};

const PAGE_SIZE = 20;

export function UsersTable({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [page, setPage]             = useState(0);
  const [users, setUsers]           = useState(initialUsers);
  const [isPending, startTransition] = useTransition();

  const filtered = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (tierFilter !== "all" && u.tier !== tierFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!u.email.toLowerCase().includes(q) && !(u.display_name?.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSearch(v: string) { setSearch(v); setPage(0); }
  function handleRole(v: string)   { setRoleFilter(v); setPage(0); }
  function handleTier(v: string)   { setTierFilter(v); setPage(0); }

  async function toggleRole(userId: string, current: "user" | "admin") {
    const next = current === "admin" ? "user" : "admin";
    startTransition(async () => {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: next }),
      });
      if (res.ok) setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: next } : u));
    });
  }

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by email or name…"
            className="w-full rounded-xl border bg-card py-2 pl-9 pr-4 text-sm outline-none ring-ring focus:ring-2"
          />
        </div>
        <select value={roleFilter} onChange={(e) => handleRole(e.target.value)}
          className="rounded-xl border bg-card px-3 py-2 text-sm outline-none ring-ring focus:ring-2">
          <option value="all">All roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <select value={tierFilter} onChange={(e) => handleTier(e.target.value)}
          className="rounded-xl border bg-card px-3 py-2 text-sm outline-none ring-ring focus:ring-2">
          <option value="all">All tiers</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="ultimate">Ultimate</option>
        </select>
        <span className="text-sm text-muted-foreground">{filtered.length} users</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Last sign-in</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paged.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-muted/30">
                <td className="px-4 py-3">
                  <p className="max-w-[180px] truncate font-medium">{u.display_name ?? "—"}</p>
                  <p className="max-w-[180px] truncate text-xs text-muted-foreground">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                    u.role === "admin"
                      ? "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                      : "bg-muted text-muted-foreground",
                  )}>
                    {u.role === "admin" && <ShieldAlert className="size-3" />}
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", TIER_CLS[u.tier] ?? TIER_CLS.free)}>
                    {u.tier}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", STATUS_CLS[u.sub_status] ?? STATUS_CLS.inactive)}>
                    {u.sub_status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">{fmtDate(u.joined)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                  {u.last_sign_in ? fmtDate(u.last_sign_in) : "—"}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleRole(u.id, u.role)}
                    disabled={isPending}
                    title={u.role === "admin" ? "Revoke admin" : "Grant admin"}
                    className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    {u.role === "admin"
                      ? <><ShieldAlert className="size-3 text-violet-600" /> Revoke</>
                      : <><Shield className="size-3" /> Make admin</>
                    }
                  </button>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No users match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Page {page + 1} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
              className="rounded-lg border px-3 py-1 hover:bg-muted disabled:opacity-40">Prev</button>
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="rounded-lg border px-3 py-1 hover:bg-muted disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
