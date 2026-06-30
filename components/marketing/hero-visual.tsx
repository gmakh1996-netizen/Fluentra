"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, Mic, Flame } from "lucide-react";
import { EASE_OUT } from "@/lib/motion";

/** Animated voice waveform — a row of bars that breathe. Static when reduced. */
function Waveform({ reduce }: { reduce: boolean | null }) {
  const bars = React.useMemo(
    () => Array.from({ length: 28 }, (_, i) => 0.25 + Math.abs(Math.sin(i * 1.1)) * 0.75),
    [],
  );
  return (
    <div className="flex h-10 items-center gap-[3px]" aria-hidden>
      {bars.map((h, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-brand-gradient"
          style={{ height: `${(h * 100).toFixed(2)}%` }}
          animate={reduce ? undefined : { scaleY: [h, h * 0.35, h * 1, h * 0.6, h] }}
          transition={
            reduce
              ? undefined
              : { duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: (i % 7) * 0.12 }
          }
        />
      ))}
    </div>
  );
}

/** SVG progress ring that fills on mount. */
function ProgressRing({
  value,
  label,
  sub,
  color,
  reduce,
}: {
  value: number;
  label: string;
  sub: string;
  color: string;
  reduce: boolean | null;
}) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid size-16 place-items-center">
        <svg className="size-16 -rotate-90" viewBox="0 0 64 64" aria-hidden>
          <circle cx="32" cy="32" r={r} className="fill-none stroke-muted" strokeWidth="6" />
          <motion.circle
            cx="32"
            cy="32"
            r={r}
            className="fill-none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={reduce ? { strokeDashoffset: offset } : { strokeDashoffset: c }}
            whileInView={{ strokeDashoffset: offset }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: EASE_OUT }}
          />
        </svg>
        <span className="absolute text-sm font-semibold tabular-nums">{value}%</span>
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

const float = (reduce: boolean | null, delay = 0) =>
  reduce
    ? {}
    : {
        animate: { y: [0, -10, 0] },
        transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const, delay },
      };

/**
 * Original hero composition: a glowing gradient orb behind a frosted glass
 * "live tutor" panel, with floating chat bubbles, a voice waveform, a live
 * pronunciation-score pill and progress rings. All motion respects
 * prefers-reduced-motion.
 */
export function HeroVisual() {
  const reduce = useReducedMotion();

  return (
    <div className="relative mx-auto aspect-square w-full max-w-md select-none sm:max-w-lg">
      {/* Ambient orb */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 size-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gradient opacity-30 blur-3xl"
        animate={reduce ? undefined : { scale: [1, 1.08, 1], opacity: [0.3, 0.42, 0.3] }}
        transition={reduce ? undefined : { duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main tutor panel */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: EASE_OUT }}
        className="surface-glass absolute left-1/2 top-1/2 w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-xl p-5 shadow-lg"
      >
        <div className="flex items-center gap-3 border-b pb-3">
          <span className="grid size-9 place-items-center rounded-full bg-brand-gradient text-white shadow-glow">
            <Sparkles className="size-4" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">AI Tutor · Casual</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-success" /> Listening · B1
            </p>
          </div>
        </div>

        <div className="space-y-3 py-4">
          <motion.div
            initial={reduce ? false : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, ease: EASE_OUT }}
            className="max-w-[78%] rounded-2xl rounded-tl-sm bg-secondary px-3.5 py-2.5 text-sm"
          >
            How do I say “I’ve been learning for three months”?
          </motion.div>
          <motion.div
            initial={reduce ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, ease: EASE_OUT }}
            className="ml-auto max-w-[82%] rounded-2xl rounded-tr-sm bg-brand-gradient px-3.5 py-2.5 text-sm text-white shadow-sm"
          >
            “He estado aprendiendo durante tres meses.” Try saying it — I’ll score your accent.
          </motion.div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border bg-card/60 px-3 py-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-gradient text-white animate-pulse-ring">
            <Mic className="size-4" />
          </span>
          <Waveform reduce={reduce} />
        </div>
      </motion.div>

      {/* Floating pronunciation pill */}
      <motion.div
        {...float(reduce, 0.4)}
        initial={reduce ? false : { opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="surface-glass absolute -right-2 top-6 rounded-xl p-3 shadow-md sm:right-0"
      >
        <p className="text-xs text-muted-foreground">Pronunciation</p>
        <p className="text-2xl font-bold text-gradient tabular-nums">96%</p>
      </motion.div>

      {/* Floating progress card */}
      <motion.div
        {...float(reduce, 1.2)}
        initial={reduce ? false : { opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="surface-glass absolute -left-3 bottom-8 space-y-3 rounded-xl p-4 shadow-md sm:-left-6"
      >
        <ProgressRing value={72} label="Daily goal" sub="36 / 50 XP" color="var(--chart-1)" reduce={reduce} />
        <div className="flex items-center gap-2 text-sm">
          <Flame className="size-4 text-warning" />
          <span className="font-semibold">24-day streak</span>
        </div>
      </motion.div>
    </div>
  );
}
