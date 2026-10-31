import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

import { TRANSITION_MS, transitionFor, type SectionTransition } from '../lib/transitions'

/**
 * CINEMATIC SECTION TRANSITION
 * ---------------------------------------------------------------
 * Rendered once at the app root. `navigate()` calls `play(id)` and
 * scrolls immediately — the overlay is pure decoration laid over a
 * scroll that has already started, so it can never delay navigation or
 * block a click (pointer-events: none throughout).
 */
export function useSectionTransition() {
  const reduce = useReducedMotion()
  const [active, setActive] = useState<{ key: number; target: SectionTransition } | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const play = useCallback(
    (id: string) => {
      if (reduce) return
      window.clearTimeout(timer.current)
      setActive({ key: Date.now(), target: transitionFor(id) })
      timer.current = window.setTimeout(() => setActive(null), TRANSITION_MS)
    },
    [reduce],
  )

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return { play, activeId: active?.key ?? 0, transition: active?.target ?? null }
}

export function SectionTransitionOverlay({
  transition,
  activeKey,
}: {
  transition: SectionTransition | null
  activeKey: number
}) {
  const reduce = useReducedMotion()
  if (reduce || !transition) return null

  return (
    <motion.div
      key={activeKey}
      className="pointer-events-none fixed inset-0 z-[240] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      aria-hidden="true"
      data-section-transition
    >
      {/* the tone shift — barely there, just enough to read as a handshake */}
      <motion.div
        className="absolute inset-0 bg-void"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.28, 0] }}
        transition={{ duration: 0.62, times: [0, 0.25, 1], ease: 'easeOut' }}
      />

      {/* travelling scan line */}
      <motion.div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-neon to-transparent"
        initial={{ top: '-2%', opacity: 0 }}
        animate={{ top: '102%', opacity: [0, 0.9, 0] }}
        transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* status line */}
      <motion.div
        className="font-tech absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: [0, 1, 1, 0], y: 0 }}
        transition={{ duration: 0.62, times: [0, 0.18, 0.72, 1] }}
      >
        <span className="inline-flex items-center gap-2 border border-neon/25 bg-void/85 px-3 py-2 text-[0.6rem] tracking-[0.22em] text-neon backdrop-blur-sm">
          <span className="h-1 w-1 animate-pulse-dot rounded-full bg-neon" />
          {transition.message}
        </span>
        <span className="mt-2 block text-[0.5rem] tracking-[0.3em] text-mute/50">
          {transition.detail}
        </span>
      </motion.div>
    </motion.div>
  )
}
