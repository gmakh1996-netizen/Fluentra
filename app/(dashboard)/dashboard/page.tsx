import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { requireUserPage } from "@/lib/auth";
import { routes } from "@/config/site";
import { PLANS } from "@/config/plans";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { user, profile } = await requireUserPage();
  const name = profile?.display_name?.split(" ")[0] ?? "there";
  const tier = profile?.subscription_tier ?? "free";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Welcome back, {name} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">{user.email}</p>
        </div>
        <Badge variant={tier === "free" ? "secondary" : "gradient"} className="capitalize">
          {PLANS[tier].name} plan
        </Badge>
      </div>

      {/* Onboarding nudge for new accounts */}
      {!profile?.onboarded && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" /> Finish setting up
            </CardTitle>
            <CardDescription>
              Tell us your language and goals so your tutor can personalize every lesson.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="gradient">
              <Link href={routes.onboarding}>
                Start onboarding <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>You’re signed in 🎉</CardTitle>
          <CardDescription>
            Authentication is fully wired — your session is protected by middleware and row-level
            security. Learning surfaces (chat, lessons, voice and more) arrive in the next phases.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
