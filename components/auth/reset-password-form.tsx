"use client";

import { useActionState } from "react";
import { updatePassword } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { AuthMessage } from "@/components/auth/auth-message";
import { PasswordInput } from "@/components/auth/password-input";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, undefined);

  return (
    <form action={action} className="space-y-4">
      <AuthMessage state={state} />
      <div className="grid gap-2">
        <Label htmlFor="password">New password</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirm">Confirm new password</Label>
        <PasswordInput
          id="confirm"
          name="confirm"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Re-enter your password"
        />
      </div>
      <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={pending}>
        {pending && <Spinner className="text-current" />}
        Update password
      </Button>
    </form>
  );
}
