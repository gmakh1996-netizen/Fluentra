import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Set a new password" };

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5 text-center lg:text-left">
        <h1 className="font-display text-2xl font-bold tracking-tight">Set a new password</h1>
        <p className="text-muted-foreground">
          Choose a strong password you don’t use anywhere else.
        </p>
      </header>

      <ResetPasswordForm />
    </div>
  );
}
