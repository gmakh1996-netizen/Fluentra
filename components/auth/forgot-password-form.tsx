"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { AuthMessage } from "@/components/auth/auth-message";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);

  // Once the email is sent, replace the form with the confirmation only.
  if (state?.success) {
    return <AuthMessage state={state} />;
  }

  return (
    <form action={action} className="space-y-4">
      <AuthMessage state={state} />
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </div>
      <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={pending}>
        {pending && <Spinner className="text-current" />}
        Send reset link
      </Button>
    </form>
  );
}
