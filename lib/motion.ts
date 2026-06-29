import type { Easing, Transition, Variants } from "framer-motion";

/**
 * Shared Framer Motion vocabulary. Centralizing easings/variants keeps motion
 * consistent and on-brand (calm, premium) across the app. Components that use
 * these should still respect `prefers-reduced-motion` — see `useReducedMotion`
 * from framer-motion, which automatically neutralizes transforms when set.
 */

/** Brand easing — a soft "ease-out-expo"-like curve used for entrances. */
export const EASE_OUT: Easing = [0.22, 1, 0.36, 1];
export const EASE_IN_OUT: Easing = [0.65, 0, 0.35, 1];

export const springSoft: Transition = { type: "spring", stiffness: 260, damping: 26 };
export const springSnappy: Transition = { type: "spring", stiffness: 420, damping: 32 };

/** Fade in from slightly below — the default entrance for sections/cards. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: EASE_OUT } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: EASE_OUT } },
};

/**
 * Stagger children entrances. Apply to a parent with `initial="hidden"` +
 * `whileInView="visible"`; give each child the `fadeUp`/`fadeIn` variants.
 */
export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
});

/** Convenience props for an in-view reveal that runs once. */
export const inViewOnce = {
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, amount: 0.25 },
} as const;

/** Subtle hover/tap feedback for interactive cards and buttons. */
export const hoverLift = {
  whileHover: { y: -3, transition: springSnappy },
  whileTap: { scale: 0.98 },
} as const;
