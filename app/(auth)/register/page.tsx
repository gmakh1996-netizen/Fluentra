import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/config/site";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create your account" };

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5 text-center lg:text-left">
        <h1 className="font-display text-2xl font-bold tracking-tight">Start learning free</h1>
        <p className="text-muted-foreground">
          No credit card required. Your first lesson is minutes away.
        </p>
      </header>

      <RegisterForm />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={routes.login} className="font-medium text-primary hover:text-accent">
          Sign in
        </Link>
      </p>
    </div>
  );
}
