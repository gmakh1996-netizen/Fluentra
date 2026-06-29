import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin" };

export default function AdminHomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Admin panel</h1>
        <p className="mt-1 text-muted-foreground">
          Restricted area — only users with the <code>admin</code> role can reach this page.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-success" /> Role-based access confirmed
          </CardTitle>
          <CardDescription>
            You passed the server-side <code>requireAdminPage</code> guard. Users, subscriptions,
            AI-usage and content management tools are built in the admin phase.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
