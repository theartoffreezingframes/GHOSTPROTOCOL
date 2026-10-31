import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { playSound } from '../lib/audio'

/**
 * SECRET ACCESS EASTER EGGS
 * ---------------------------------------------------------------
 * Purely additive discoveries. Nothing here is required to use the
 * site, and every listener bails out when the visitor is typing:
 *
 *  • `ghost://override` typed anywhere → a short system response.
 *  • Konami sequence ↑↑↓↓←→←→BA → a protocol-wide green surge.
 *  • A hidden transmission triggered by a deliberate tap sequence on
 *    the footer emblem (works on touch, where keys don't exist).
 *
 * No browser shortcuts are intercepted: we never preventDefault on a
 * keystroke, so copy, paste, find and devtools keep working.
 */

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
] as const

const COMMAND = 'ghost://override'

type Egg = 'override' | 'konami' | 'transmission'

const COPY: Record<Egg, { title: string; lines: string[] }> = {
  override: {
    title: 'OVERRIDE ACCEPTED',
    lines: [
      'COMMAND INTERPRETED // ghost://override',
      'PROTOCOL LAYER UNSEALED FOR THIS SESSION.',
      'NO SECURITY WAS BYPASSED — THIS IS A HIDDEN MESSAGE.',
    ],
  },
  konami: {
    title: 'PROTOCOL SURGE',
    lines: [
      'SEQUENCE RECOGNISED // OPERATOR CLEARANCE UNCHANGED',
      'ALL SIX NODES REPORTING.',
      'THE GHOST WAS HERE.',
    ],
  },
  transmission: {
    title: 'HIDDEN TRANSMISSION',
    lines: [
      'A MESSAGE WAS LEFT ON THIS CHANNEL.',
      'THE GHOST WAS HERE.',
      'SEE YOU ON THE OTHER SIDE.',
    ],
  },
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable ||
    target.closest('[contenteditable="true"]') !== null
  )
}

export function EasterEggs() {
  const reduce = useReducedMotion()
  const [egg, setEgg] = useState<Egg | null>(null)
  const [surge, setSurge] = useState(false)
  const bufferRef = useRef('')
  const konamiRef = useRef(0)
  const surgeTimer = useRef<number | undefined>(undefined)

  const trigger = useCallback(
    (which: Egg) => {
      setEgg(which)
      playSound(which === 'konami' ? 'access' : 'transmission')
      if (which === 'konami') {
        setSurge(true)
        window.clearTimeout(surgeTimer.current)
        surgeTimer.current = window.setTimeout(() => setSurge(false), 2600)
      }
    },
    [],
  )

  // ── keyboard: buffered command + konami ──
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Never intercept modified shortcuts, and never while typing.
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (isTypingTarget(event.target)) return

      const key = event.key

      // Konami
      const expected = KONAMI[konamiRef.current]
      if (key.toLowerCase() === expected.toLowerCase()) {
        konamiRef.current += 1
        if (konamiRef.current === KONAMI.length) {
          konamiRef.current = 0
          trigger('konami')
        }
      } else {
        konamiRef.current = key === KONAMI[0] ? 1 : 0
      }

      // Command buffer — single printable characters only.
      if (key.length === 1) {
        bufferRef.current = (bufferRef.current + key.toLowerCase()).slice(-COMMAND.length)
        if (bufferRef.current === COMMAND) {
          bufferRef.current = ''
          trigger('override')
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [trigger])

  // ── touch/pointer alternative: five quick taps on the footer emblem ──
  useEffect(() => {
    const taps: number[] = []
    const onTap = (event: Event) => {
      const target = event.target
      if (!(target instanceof HTMLElement) || !target.closest('[data-egg-tap]')) return
      const now = Date.now()
      taps.push(now)
      while (taps.length && now - taps[0] > 1800) taps.shift()
      if (taps.length >= 5) {
        taps.length = 0
        trigger('transmission')
      }
    }
    document.addEventListener('click', onTap)
    return () => document.removeEventListener('click', onTap)
  }, [trigger])

  // ── escape + scroll lock for the message ──
  useEffect(() => {
    if (!egg) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setEgg(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [egg])

  useEffect(() => () => window.clearTimeout(surgeTimer.current), [])

  return (
    <>
      {/* protocol-wide surge */}
      <AnimatePresence>
        {surge && !reduce && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[180]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(57,255,20,0.16),transparent_65%)]" />
            <div className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-neon/[0.08] to-transparent animate-scanline" />
            <div className="absolute inset-x-0 top-1/3 h-px bg-neon/40" />
            <div className="absolute inset-x-0 bottom-1/3 h-px bg-neon/30" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {egg && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/92 p-5 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="egg-title"
            onClick={(event) => {
              if (event.target === event.currentTarget) setEgg(null)
            }}
          >
            <motion.div
              className="relative w-full max-w-md border border-neon/30 bg-void p-5 sm:p-6"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse-dot" aria-hidden="true" />
                <span className="font-tech text-[0.55rem] tracking-[0.22em] text-neon">HIDDEN CHANNEL</span>
              </div>
              <h2
                id="egg-title"
                className="font-display text-[1.3rem] font-medium uppercase leading-tight tracking-[-0.02em] text-bone"
              >
                {COPY[egg].title}
              </h2>
              <ul className="mt-3 space-y-1.5">
                {COPY[egg].lines.map((line) => (
                  <li
                    key={line}
                    className="font-tech text-[0.62rem] leading-relaxed tracking-[0.14em] text-mute/80"
                  >
                    {line}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                autoFocus
                onClick={() => setEgg(null)}
                className="font-tech mt-5 w-full border border-line px-4 py-2.5 text-[0.62rem] tracking-[0.2em] text-bone transition-colors hover:border-neon/60 hover:text-neon"
              >
                CLOSE CHANNEL
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
