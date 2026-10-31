import type { Transition, Variants } from 'motion/react'

/**
 * GHOST PROTOCOL // MOTION SYSTEM
 * One shared timing language so every section feels choreographed
 * by the same hand. Expo-out easing, long soft durations, transforms
 * only — no layout thrash.
 */

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const
export const EASE_IN_OUT_SOFT = [0.65, 0, 0.35, 1] as const

export const transition = {
  fast: { duration: 0.4, ease: EASE_OUT_EXPO } satisfies Transition,
  base: { duration: 0.75, ease: EASE_OUT_EXPO } satisfies Transition,
  slow: { duration: 1.1, ease: EASE_OUT_EXPO } satisfies Transition,
  cinematic: { duration: 1.4, ease: EASE_OUT_EXPO } satisfies Transition,
}

/** Reveal a line out from behind a clipping mask. */
export const maskUp: Variants = {
  hidden: { y: '110%', opacity: 0 },
  show: (i: number = 0) => ({
    y: '0%',
    opacity: 1,
    transition: { duration: 1.05, ease: EASE_OUT_EXPO, delay: 0.06 * i },
  }),
}

/** Container that staggers its children. */
export const stagger = (delayChildren = 0, staggerChildren = 0.07): Variants => ({
  hidden: {},
  show: { transition: { delayChildren, staggerChildren } },
})

export const fadeUp: Variants = {
  hidden: { y: 26, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.85, ease: EASE_OUT_EXPO } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 1.1, ease: EASE_OUT_EXPO } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.965 },
  show: { opacity: 1, scale: 1, transition: { duration: 1.1, ease: EASE_OUT_EXPO } },
}

/** Shared viewport config for one-shot scroll reveals. */
export const viewportOnce = { once: true, amount: 0.35 } as const
export const viewportSoft = { once: true, amount: 0.18 } as const
