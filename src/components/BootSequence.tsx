import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { boot } from '../data/site'
import { EASE_OUT_EXPO } from '../lib/motion'
import { Emblem } from './Emblem'

type BootSequenceProps = {
  onComplete: () => void
  /** Persisted flag — when true the sequence is skipped. */
  skipped: boolean
}

const LINE_DELAY = 170
const START_DELAY = 160

/**
 * Terminal initialisation. Short, skippable, never replayed once
 * cleared. Reduced-motion visitors get an instant hand-off.
 */
export function BootSequence({ onComplete, skipped }: BootSequenceProps) {
  const reduce = useReducedMotion()
  const [visibleLines, setVisibleLines] = useState(0)
  const [granted, setGranted] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [progress, setProgress] = useState(0)
  const finished = useRef(false)

  const finish = useCallback(() => {
    if (finished.current) return
    finished.current = true
    setLeaving(true)
    window.setTimeout(onComplete, 620)
  }, [onComplete])

  // Reduced motion / returning visitors exit immediately.
  useEffect(() => {
    if (skipped || reduce) {
      finished.current = true
      onComplete()
    }
  }, [onComplete, reduce, skipped])

  useEffect(() => {
    if (skipped || reduce) return
    const timers: number[] = []
    boot.lines.forEach((_, i) => {
      timers.push(
        window.setTimeout(() => {
          setVisibleLines(i + 1)
          setProgress(Math.round(((i + 1) / (boot.lines.length + 1)) * 100))
        }, START_DELAY + i * LINE_DELAY),
      )
    })
    timers.push(
      window.setTimeout(() => {
        setGranted(true)
        setProgress(100)
      }, START_DELAY + boot.lines.length * LINE_DELAY + 140),
    )
    // Brief hold on ACCESS GRANTED, then hand off to the site.
    timers.push(window.setTimeout(finish, START_DELAY + boot.lines.length * LINE_DELAY + 560))
    return () => timers.forEach(clearTimeout)
  }, [finish, reduce, skipped])

  // Escape skips the sequence for keyboard users.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [finish])

  if (skipped || reduce) return null

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          key="boot"
          role="dialog"
          aria-modal="true"
          aria-label="Ghost Protocol system initialisation"
          className="fixed inset-0 z-[200] flex flex-col overflow-hidden bg-void"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(6px)' }}
          transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
        >
          {/* ambient layers */}
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" aria-hidden="true" />
          <div
            className="pointer-events-none absolute inset-x-0 h-px bg-neon/60 animate-scanline"
            aria-hidden="true"
            style={{ top: 0 }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.5] noise-overlay mix-blend-soft-light"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[90px]"
            style={{ background: 'radial-gradient(circle, rgba(57,255,20,0.2), transparent 70%)' }}
            aria-hidden="true"
          />

          <div className="relative flex h-full w-full flex-col justify-between px-5 py-6 sm:px-10 sm:py-8">
            {/* top row */}
            <motion.div
              className="flex items-start justify-between gap-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.1 }}
            >
              <span className="tech-label flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse-dot" aria-hidden="true" />
                {boot.signed}
              </span>
              <button
                type="button"
                onClick={finish}
                className="tech-label group flex items-center gap-2 text-mute transition-colors hover:text-neon focus-visible:text-neon"
              >
                {boot.skip}
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
                  →
                </span>
              </button>
            </motion.div>

            {/* centre */}
            <div className="flex flex-col items-center text-center">
              <motion.div
                className="mb-7 h-16 w-16 sm:h-20 sm:w-20"
                initial={{ opacity: 0, scale: 0.8, filter: 'blur(8px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 0.15 }}
              >
                <Emblem animated />
              </motion.div>

              <div className="overflow-hidden">
                <motion.h1
                  className="font-display text-[clamp(2.1rem,9vw,4.6rem)] font-medium uppercase leading-[0.9] tracking-[-0.04em] text-bone"
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 0.2 }}
                >
                  {boot.title}
                </motion.h1>
              </div>

              <motion.p
                className="font-tech mt-3 text-[0.72rem] text-neon sm:text-[0.72rem]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.55 }}
              >
                {boot.subtitle}
                <span className="ml-1 inline-block h-3 w-[7px] translate-y-[1px] bg-neon animate-blink" aria-hidden="true" />
              </motion.p>

              {/* terminal log */}
              <div
                className="mt-9 w-full max-w-[30rem] text-left"
                aria-live="polite"
                aria-atomic="false"
              >
                <ul className="space-y-1.5">
                  {boot.lines.slice(0, visibleLines).map((line) => (
                    <motion.li
                      key={line}
                      className="font-tech flex items-baseline gap-2 text-[0.7rem] tracking-[0.16em] text-mute sm:text-[0.72rem]"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                    >
                      <span className="text-neon/70" aria-hidden="true">
                        &gt;
                      </span>
                      {line}
                      <span className="ml-auto pl-4 text-neon" aria-hidden="true">
                        OK
                      </span>
                    </motion.li>
                  ))}
                </ul>

                <AnimatePresence>
                  {granted && (
                    <motion.p
                      className="font-tech mt-3 flex items-center gap-2 text-[0.68rem] tracking-[0.2em] text-neon sm:text-[0.74rem]"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                      style={{ textShadow: '0 0 22px rgba(57,255,20,0.45)' }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-neon" aria-hidden="true" />
                      {boot.granted}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* bottom progress */}
            <div className="w-full">
              <div className="mb-2 flex items-end justify-between font-tech text-[0.66rem] tracking-[0.2em] text-mute sm:text-[0.7rem]">
                <span>DECRYPTING CHANNEL</span>
                <span className="tabular-nums text-neon" aria-hidden="true">
                  {String(progress).padStart(3, '0')}%
                </span>
              </div>
              <div className="relative h-[2px] w-full overflow-hidden bg-line">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-neon"
                  style={{ boxShadow: '0 0 12px rgba(57,255,20,0.8)' }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.34, ease: EASE_OUT_EXPO }}
                />
              </div>
              <div className="mt-2 flex justify-between font-tech text-[0.7rem] tracking-[0.18em] text-mute/75">
                <span>NODE // GHOST-03</span>
                <span className="hidden sm:inline">AES-256 // TUNNEL ACTIVE</span>
                <span>BUILD 0.3.1</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** localStorage key used to avoid replaying the boot on every visit. */
export const BOOT_STORAGE_KEY = 'gp.boot.v1'
