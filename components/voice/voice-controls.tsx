"use client";

import { CONVERSATION_MODES, CEFR_LEVELS } from "@/lib/ai/types";
import { LANGUAGE_OPTIONS, languageName } from "@/config/languages";
import { VOICES, SPEED_OPTIONS } from "@/config/voices";
import type { VoiceSettings } from "@/hooks/use-voice-conversation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const fieldClass =
  "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none transition-shadow focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50";

const MODE_LABELS: Record<string, string> = {
  casual: "Casual",
  business: "Business",
  travel: "Travel",
  interview: "Interview",
  pronunciation: "Pronunciation",
  grammar: "Grammar",
};

export function VoiceControls({
  settings,
  onChange,
  disabled,
}: {
  settings: VoiceSettings;
  onChange: (patch: Partial<VoiceSettings>) => void;
  disabled?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Session</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="vc-target">I’m learning</Label>
          <select
            id="vc-target"
            className={fieldClass}
            disabled={disabled}
            value={settings.targetCode}
            onChange={(e) =>
              onChange({ targetCode: e.target.value, targetName: languageName(e.target.value) })
            }
          >
            {LANGUAGE_OPTIONS.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="vc-level">Level</Label>
            <select
              id="vc-level"
              className={fieldClass}
              disabled={disabled}
              value={settings.level}
              onChange={(e) => onChange({ level: e.target.value as VoiceSettings["level"] })}
            >
              {CEFR_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="vc-mode">Mode</Label>
            <select
              id="vc-mode"
              className={fieldClass}
              disabled={disabled}
              value={settings.mode}
              onChange={(e) => onChange({ mode: e.target.value as VoiceSettings["mode"] })}
            >
              {CONVERSATION_MODES.map((m) => (
                <option key={m} value={m}>
                  {MODE_LABELS[m]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="vc-voice">Tutor voice</Label>
          <select
            id="vc-voice"
            className={fieldClass}
            disabled={disabled}
            value={settings.voiceId}
            onChange={(e) => onChange({ voiceId: e.target.value })}
          >
            {VOICES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} · {v.gender === "female" ? "♀" : "♂"} {v.accent} — {v.description}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-1.5">
          <Label>Speaking speed</Label>
          <div className="flex gap-1.5">
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s.value}
                type="button"
                disabled={disabled}
                onClick={() => onChange({ speed: s.value })}
                aria-pressed={settings.speed === s.value}
                className={`h-8 flex-1 rounded-md border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
                  settings.speed === s.value
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "bg-background hover:bg-secondary"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
