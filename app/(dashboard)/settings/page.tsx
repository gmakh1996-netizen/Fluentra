"use client";

import { useState, useTransition, useEffect } from "react";
import { User, Globe, CreditCard, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  email: string;
  displayName: string | null;
  tier: string;
  nativeLang: string | null;
  targetLang: string | null;
  level: string | null;
};

function SettingsForm({ email, displayName, tier, nativeLang, targetLang, level }: Props) {
  const [name, setName]   = useState(displayName ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function save() {
    setError("");
    setSaved(false);
    startTransition(async () => {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: name }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError("Failed to save. Please try again.");
      }
    });
  }

  const tierLabel = tier === "pro" ? "Pro" : tier === "enterprise" ? "Enterprise" : "Free";
  const tierColor = tier === "pro" ? "text-violet-600" : tier === "enterprise" ? "text-amber-600" : "text-muted-foreground";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile and preferences.</p>
      </div>

      {/* Profile */}
      <section className="rounded-2xl border bg-card p-5 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <User className="size-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm">Profile</h2>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground" htmlFor="email">Email</label>
          <input id="email" type="email" value={email} disabled
            className="w-full rounded-xl border bg-muted/30 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed" />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground" htmlFor="display_name">Display name</label>
          <input id="display_name" type="text" value={name} onChange={(e) => setName(e.target.value)}
            maxLength={80} placeholder="Your name"
            className="w-full rounded-xl border bg-card px-3 py-2 text-sm outline-none ring-ring focus:ring-2" />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={save} disabled={isPending}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : saved ? <Check className="size-4" /> : null}
            {saved ? "Saved!" : "Save changes"}
          </button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </section>

      {/* Language preferences */}
      <section className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="size-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm">Language preferences</h2>
        </div>

        {nativeLang || targetLang ? (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Native language</p>
              <p className="font-medium">{nativeLang ?? "—"}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Learning</p>
              <p className="font-medium">{targetLang ?? "—"}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Level</p>
              <p className="font-medium">{level ?? "—"}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No language set up yet.</p>
        )}

        <p className="text-xs text-muted-foreground">
          To change your learning language or level, start a new conversation in{" "}
          <a href="/learn/chat" className="underline underline-offset-2 hover:text-foreground">AI Chat</a>{" "}
          and update the settings panel.
        </p>
      </section>

      {/* Subscription */}
      <section className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="size-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm">Subscription</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current plan</p>
            <p className={`font-semibold text-sm ${tierColor}`}>{tierLabel}</p>
          </div>
          {tier === "free" ? (
            <a href="/pricing"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              Upgrade to Pro
            </a>
          ) : (
            <a href="/api/billing/portal"
              className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
              Manage billing
            </a>
          )}
        </div>
      </section>
    </div>
  );
}

export default function SettingsPage() {
  const [data, setData] = useState<Props | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => {
        if (r.status === 401) { router.push("/login"); return null; }
        return r.json();
      })
      .then((d: Props | null) => d && setData(d));
  }, [router]);

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
        <Loader2 className="mr-2 size-4 animate-spin" />Loading…
      </div>
    );
  }

  return <SettingsForm {...data} />;
}
