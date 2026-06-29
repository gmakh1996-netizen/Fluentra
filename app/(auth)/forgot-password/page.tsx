import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { routes } from "@/config/site";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5 text-center lg:text-left">
        <h1 className="font-display text-2xl font-bold tracking-tight">Forgot your password?</h1>
        <p className="text-muted-foreground">
          Enter your email and we’ll send you a link to reset it.
        </p>
      </header>

      <ForgotPasswordForm />

      <Link
        href={routes.login}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-accent"
      >
        <ArrowLeft className="size-4" /> Back to sign in
      </Link>
    </div>
  );
}
