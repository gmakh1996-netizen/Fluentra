"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { fadeUp, fadeIn, scaleIn, staggerContainer, EASE_OUT } from "@/lib/motion";

type Preset = "fade-up" | "fade" | "scale";

const PRESETS: Record<Preset, Variants> = {
  "fade-up": fadeUp,
  fade: fadeIn,
  scale: scaleIn,
};

/**
 * Drop-in scroll/entrance reveal. Wraps children in a Framer Motion element
 * that animates in once on view. Automatically disabled under
 * `prefers-reduced-motion` so it degrades to a static element.
 */
export function Reveal({
  children,
  preset = "fade-up",
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  preset?: Preset;
  delay?: number;
  className?: string;
  as?: keyof typeof motion;
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  if (reduce) {
    const Tag = as as React.ElementType;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={PRESETS[preset]}
      transition={{ delay, ease: EASE_OUT }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Staggers the entrance of its direct children. Pair each child with a
 * <Reveal> (or motion element using the same variant names).
 */
export function RevealGroup({
  children,
  stagger = 0.08,
  className,
}: {
  children: React.ReactNode;
  stagger?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={staggerContainer(stagger)}
    >
      {children}
    </motion.div>
  );
}
