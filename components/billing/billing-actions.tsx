"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/site";
import type { Tier } from "@/config/plans";

export function BillingActions({
  tier,
  hasSub,
  portalOnly = false,
}: {
  tier: Tier;
  hasSub: boolean;
  portalOnly?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json() as { url?: string; error?: { message: string } };
      if (data.url) window.location.href = data.url;
      else alert(data.error?.message ?? "Could not open billing portal.");
    } finally {
      setLoading(false);
    }
  }

  if (portalOnly) {
    return (
      <Button variant="outline" size="sm" onClick={openPortal} disabled={loading || !hasSub}>
        {loading ? <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <ExternalLink className="size-3.5" />}
        Stripe portal
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tier === "free" ? (
        <Button asChild variant="gradient" size="sm">
          <Link href={routes.pricing}>
            Upgrade <ArrowUpRight className="size-3.5" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={openPortal} disabled={loading}>
          {loading ? <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <ExternalLink className="size-3.5" />}
          Manage plan
        </Button>
      )}
    </div>
  );
}
