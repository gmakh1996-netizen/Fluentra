"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpWithPassword } from "@/app/(auth)/actions";
import { routes } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { AuthMessage } from "@/components/auth/auth-message";
import { PasswordInput } from "@/components/auth/password-input";

export function RegisterForm() {
  const [state, action, pending] = useActionState(signUpWithPassword, undefined);

  return (
    <div>
      <OAuthButtons next={routes.onboarding} />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-3 text-muted-foreground">or sign up with email</span>
        </div>
      </div>

      <form action={action} className="space-y-4">
        <AuthMessage state={state} />
        <div className="grid gap-2">
          <Label htmlFor="displayName">Name</Label>
          <Input
            id="displayName"
            name="displayName"
            autoComplete="name"
            required
            placeholder="Alex Rivera"
            defaultValue={state?.fields?.displayName}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            defaultValue={state?.fields?.email}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            aria-describedby="password-hint"
          />
          <p id="password-hint" className="text-xs text-muted-foreground">
            Use 8+ characters with a mix of letters and numbers.
          </p>
        </div>

        <div className="flex items-start gap-2.5">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="mt-0.5 size-4 shrink-0 rounded border-input text-primary accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">
            I agree to the{" "}
            <Link href={routes.terms} className="font-medium text-primary hover:text-accent">
              Terms
            </Link>{" "}
            and{" "}
            <Link href={routes.privacy} className="font-medium text-primary hover:text-accent">
              Privacy Policy
            </Link>
            .
          </Label>
        </div>

        <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={pending}>
          {pending && <Spinner className="text-current" />}
          Create free account
        </Button>
      </form>
    </div>
  );
}
