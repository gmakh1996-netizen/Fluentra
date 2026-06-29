import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { routes } from "@/config/site";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Verify your email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
        <MailCheck className="size-7" />
      </div>
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-bold tracking-tight">Check your inbox</h1>
        <p className="text-muted-foreground">
          We sent a verification link to{" "}
          <span className="font-medium text-foreground">{email ?? "your email"}</span>. Click it to
          activate your account and start learning.
        </p>
      </header>

      <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        Didn’t get it? Check your spam folder, or wait a minute and try signing in again to resend.
      </div>

      <Button asChild variant="outline" className="w-full">
        <Link href={routes.login}>Back to sign in</Link>
      </Button>
    </div>
  );
}
