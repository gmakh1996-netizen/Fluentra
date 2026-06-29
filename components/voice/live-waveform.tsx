"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Real-time input waveform. `level` (0–1) comes from the recorder's analyser
 * and scales the bar heights live; per-bar weights give it an organic shape.
 * When inactive it rests as a flat row.
 */
export function LiveWaveform({
  level,
  active,
  bars = 36,
  className,
}: {
  level: number;
  active: boolean;
  bars?: number;
  className?: string;
}) {
  const weights = React.useMemo(
    () => Array.from({ length: bars }, (_, i) => 0.35 + Math.abs(Math.sin(i * 0.6)) * 0.65),
    [bars],
  );

  return (
    <div className={cn("flex h-12 items-center justify-center gap-[3px]", className)} aria-hidden>
      {weights.map((w, i) => {
        const pct = active ? Math.max(6, Math.min(100, (0.12 + level * w) * 100)) : 8;
        return (
          <span
            key={i}
            className="w-[3px] rounded-full bg-brand-gradient transition-[height] duration-75 ease-out"
            style={{ height: `${pct}%`, opacity: active ? 1 : 0.4 }}
          />
        );
      })}
    </div>
  );
}
