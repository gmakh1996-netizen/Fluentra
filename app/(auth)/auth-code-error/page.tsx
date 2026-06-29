import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { routes } from "@/config/site";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Link expired" };

export default function AuthCodeErrorPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-7" />
      </div>
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-bold tracking-tight">This link didn’t work</h1>
        <p className="text-muted-foreground">
          Your sign-in or verification link may have expired or already been used. Request a fresh
          one and you’ll be on your way.
        </p>
      </header>

      <div className="flex flex-col gap-2">
        <Button asChild variant="gradient">
          <Link href={routes.login}>Back to sign in</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href={routes.forgotPassword}>Request a new reset link</Link>
        </Button>
      </div>
    </div>
  );
}
