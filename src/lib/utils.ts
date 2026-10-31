/** Tiny class-name joiner — keeps JSX readable without pulling in a dependency. */
export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

/** Pads an index into an operative/mission style identifier: 1 -> "001". */
export function pad3(value: number) {
  return String(value).padStart(3, '0')
}

/** True when the visitor asked the OS to reduce motion. */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** True for mouse / trackpad style input, false for touch-first devices. */
export function hasFinePointer() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(pointer: fine)').matches
}
