"use client";

import * as React from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { heroStats } from "@/content/landing";

function CountUp({
  to,
  decimals = 0,
  suffix,
}: {
  to: number;
  decimals?: number;
  suffix: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, to, reduce]);

  return (
    <span ref={ref} className="tabular-nums">
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/** Headline metrics with an on-scroll count-up animation. */
export function Stats() {
  return (
    <section aria-label="Fluentra by the numbers" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border shadow-sm lg:grid-cols-4">
        {heroStats.map((s) => (
          <div key={s.label} className="bg-card px-6 py-8 text-center">
            <dt className="sr-only">{s.label}</dt>
            <dd className="font-display text-4xl font-bold tracking-tight text-gradient sm:text-5xl">
              <CountUp to={s.value} suffix={s.suffix} decimals={"decimals" in s ? s.decimals : 0} />
            </dd>
            <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </dl>
    </section>
  );
}
