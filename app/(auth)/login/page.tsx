import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/config/site";
import { LoginForm } from "@/components/auth/login-form";
import { AuthMessage } from "@/components/auth/auth-message";

export const metadata: Metadata = { title: "Sign in" };

const OAUTH_ERRORS: Record<string, string> = {
  oauth: "We couldn't complete that sign-in. Please try again.",
  provider: "That sign-in method isn't available.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="space-y-6">
      <header className="space-y-1.5 text-center lg:text-left">
        <h1 className="font-display text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to keep your streak going.</p>
      </header>

      {error && <AuthMessage state={{ error: OAUTH_ERRORS[error] ?? "Something went wrong." }} />}

      <LoginForm next={next} />

      <p className="text-center text-sm text-muted-foreground">
        New to Fluentra?{" "}
        <Link href={routes.register} className="font-medium text-primary hover:text-accent">
          Create an account
        </Link>
      </p>
    </div>
  );
}
