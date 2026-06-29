"use client";

import { CONVERSATION_MODES, CEFR_LEVELS } from "@/lib/ai/types";
import { LANGUAGE_OPTIONS } from "@/config/languages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Settings2 } from "lucide-react";

const fieldClass =
  "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none transition-shadow focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50";

const MODE_LABELS: Record<string, string> = {
  casual: "Casual chat",
  business: "Business",
  travel: "Travel",
  interview: "Job interview",
  pronunciation: "Pronunciation",
  grammar: "Grammar focus",
};

interface ChatSettingsProps {
  targetLanguage: string;
  nativeLanguage: string;
  level: string;
  mode: string;
  onTargetChange: (v: string) => void;
  onNativeChange: (v: string) => void;
  onLevelChange: (v: string) => void;
  onModeChange: (v: string) => void;
  disabled?: boolean;
}

export function ChatSettings({
  targetLanguage,
  nativeLanguage,
  level,
  mode,
  onTargetChange,
  onNativeChange,
  onLevelChange,
  onModeChange,
  disabled,
}: ChatSettingsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings2 className="size-4" />
          Session settings
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="cs-target">I&apos;m learning</Label>
          <select
            id="cs-target"
            className={fieldClass}
            disabled={disabled}
            value={targetLanguage}
            onChange={(e) => onTargetChange(e.target.value)}
          >
            {LANGUAGE_OPTIONS.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="cs-native">My language</Label>
          <select
            id="cs-native"
            className={fieldClass}
            disabled={disabled}
            value={nativeLanguage}
            onChange={(e) => onNativeChange(e.target.value)}
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
            <Label htmlFor="cs-level">Level</Label>
            <select
              id="cs-level"
              className={fieldClass}
              disabled={disabled}
              value={level}
              onChange={(e) => onLevelChange(e.target.value)}
            >
              {CEFR_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cs-mode">Mode</Label>
            <select
              id="cs-mode"
              className={fieldClass}
              disabled={disabled}
              value={mode}
              onChange={(e) => onModeChange(e.target.value)}
            >
              {CONVERSATION_MODES.map((m) => (
                <option key={m} value={m}>
                  {MODE_LABELS[m] ?? m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
