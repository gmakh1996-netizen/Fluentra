"use client";

import { AlertCircle, RefreshCw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-3xl">
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-10 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-7 text-destructive" />
        </div>
        <h2 className="font-display text-lg font-semibold">
          Failed to load billing
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message && error.message !== "An error occurred"
            ? error.message
            : "Something went wrong loading your billing information."}
        </p>
        {error.digest && (
          <p className="mt-1 font-mono text-xs text-muted-foreground/60">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="outline" size="sm" onClick={reset}>
            <RefreshCw className="size-3.5" />
            Try again
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="mailto:support@fluentra.app">
              <Mail className="size-3.5" />
              Contact support
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
