"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  ArrowUpRight,
  RotateCcw,
  X,
  Settings,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/site";
import type { Tier } from "@/config/plans";

interface BillingActionsProps {
  tier: Tier;
  hasSub: boolean;
  subStatus?: string;
  cancelAtPeriodEnd?: boolean;
  /** Show only the "Manage billing" portal button (used in the payment method card). */
  portalOnly?: boolean;
}

export function BillingActions({
  tier,
  hasSub,
  subStatus = "inactive",
  cancelAtPeriodEnd = false,
  portalOnly = false,
}: BillingActionsProps) {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await res.json()) as {
        url?: string;
        error?: { message: string };
      };
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error?.message ?? "Could not open billing portal.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const Spinner = () => (
    <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );

  /* ── Portal-only mode (payment method card) ─────────────────── */
  if (portalOnly) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={openPortal}
        disabled={loading || !hasSub}
      >
        {loading ? <Spinner /> : <Settings className="size-3.5" />}
        Manage billing
      </Button>
    );
  }

  /* ── Free tier ──────────────────────────────────────────────── */
  if (tier === "free") {
    return (
      <Button asChild variant="gradient" size="sm">
        <Link href={routes.pricing}>
          Upgrade <ArrowUpRight className="size-3.5" />
        </Link>
      </Button>
    );
  }

  /* ── Fully canceled (not cancel_at_period_end) ──────────────── */
  if (subStatus === "canceled" && !cancelAtPeriodEnd) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="gradient" size="sm">
          <Link href={routes.pricing}>
            Reactivate <RotateCcw className="size-3.5" />
          </Link>
        </Button>
      </div>
    );
  }

  /* ── Pending cancellation (cancel_at_period_end = true) ─────── */
  if (cancelAtPeriodEnd) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={openPortal}
          disabled={loading || !hasSub}
        >
          {loading ? <Spinner /> : <RotateCcw className="size-3.5" />}
          Reactivate
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={openPortal}
          disabled={loading || !hasSub}
        >
          {loading ? <Spinner /> : <Settings className="size-3.5" />}
          Manage billing
        </Button>
      </div>
    );
  }

  /* ── Active / trialing / past_due ───────────────────────────── */
  return (
    <div className="flex flex-wrap gap-2">
      {/* Upgrade: only shown when not on the top tier */}
      {tier !== "ultimate" && (
        <Button asChild variant="gradient" size="sm">
          <Link href={routes.pricing}>
            Upgrade <ArrowUpRight className="size-3.5" />
          </Link>
        </Button>
      )}

      {/* Downgrade: only shown on ultimate → goes to portal */}
      {tier === "ultimate" && (
        <Button
          variant="outline"
          size="sm"
          onClick={openPortal}
          disabled={loading || !hasSub}
        >
          {loading ? <Spinner /> : <ArrowDownRight className="size-3.5" />}
          Downgrade
        </Button>
      )}

      {/* Manage billing → Stripe portal */}
      <Button
        variant="outline"
        size="sm"
        onClick={openPortal}
        disabled={loading || !hasSub}
      >
        {loading ? <Spinner /> : <ExternalLink className="size-3.5" />}
        Manage billing
      </Button>

      {/* Cancel → Stripe portal */}
      <Button
        variant="ghost"
        size="sm"
        onClick={openPortal}
        disabled={loading || !hasSub}
        className="text-muted-foreground hover:text-destructive"
      >
        {loading ? <Spinner /> : <X className="size-3.5" />}
        Cancel
      </Button>
    </div>
  );
}
