"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInWithPassword, signInWithMagicLink } from "@/app/(auth)/actions";
import { routes } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { AuthMessage } from "@/components/auth/auth-message";
import { PasswordInput } from "@/components/auth/password-input";

function Divider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-card px-3 text-muted-foreground">or continue with email</span>
      </div>
    </div>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [pw, pwAction, pwPending] = useActionState(signInWithPassword, undefined);
  const [magic, magicAction, magicPending] = useActionState(signInWithMagicLink, undefined);

  return (
    <div>
      <OAuthButtons next={next} />
      <Divider />

      <Tabs defaultValue="password">
        <TabsList className="w-full">
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="magic">Magic link</TabsTrigger>
        </TabsList>

        <TabsContent value="password">
          <form action={pwAction} className="space-y-4">
            {next && <input type="hidden" name="next" value={next} />}
            <AuthMessage state={pw} />
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                defaultValue={pw?.fields?.email}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href={routes.forgotPassword}
                  className="text-sm font-medium text-primary hover:text-accent"
                >
                  Forgot?
                </Link>
              </div>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={pwPending}>
              {pwPending && <Spinner className="text-current" />}
              Sign in
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="magic">
          <form action={magicAction} className="space-y-4">
            <AuthMessage state={magic} />
            <div className="grid gap-2">
              <Label htmlFor="magic-email">Email</Label>
              <Input
                id="magic-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
              />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={magicPending}>
              {magicPending && <Spinner className="text-current" />}
              Email me a magic link
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              No password needed — we’ll send a one-time sign-in link.
            </p>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
