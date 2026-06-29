"use client";

import Link from "next/link";
import { LogOut, LayoutDashboard, Settings, CreditCard, Shield } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { routes } from "@/config/site";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

type UserNavProps = {
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  role?: "user" | "admin";
};

function initials(name: string | null | undefined, email: string) {
  const base = name?.trim() || email;
  const parts = base.split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || base[0]?.toUpperCase();
}

/** Authenticated user menu: avatar trigger → account links, role badge, sign out. */
export function UserNav({ email, displayName, avatarUrl, role = "user" }: UserNavProps) {
  const isAdmin = role === "admin";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Open account menu"
        >
          <Avatar className="size-9 ring-1 ring-border">
            {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
            <AvatarFallback className="bg-brand-gradient text-xs text-white">
              {initials(displayName, email)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              {displayName || "Learner"}
              {isAdmin && (
                <Badge variant="gradient" className="px-1.5 py-0 text-[10px]">
                  Admin
                </Badge>
              )}
            </span>
            <span className="truncate text-xs text-muted-foreground">{email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={routes.dashboard}>
              <LayoutDashboard /> Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={routes.settings}>
              <Settings /> Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={routes.billing}>
              <CreditCard /> Billing
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link href={routes.admin}>
                <Shield /> Admin panel
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <form action={signOut}>
          <DropdownMenuItem asChild variant="destructive">
            <button type="submit" className="w-full">
              <LogOut /> Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
