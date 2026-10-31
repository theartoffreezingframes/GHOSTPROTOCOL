import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Fingerprint, ShieldCheck, X } from 'lucide-react'

import { activeOperatives, missionHistory, type Operative } from '../data/team'
import { statusDisplay } from '../data/missions'
import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'
import { playSound } from '../lib/audio'
import { HudFrame } from './HudFrame'

/**
 * CLASSIFIED DOSSIER ACCESS
 * ---------------------------------------------------------------
 * A cinematic opening sequence in front of the existing dossier.
 * This is visual storytelling only — it authenticates nothing and
 * gates nothing. The content underneath is already public on the
 * page. Reduced motion skips straight to the record.
 */

type DossierContextValue = {
  open: (codename: string) => void
  close: () => void
  activeCodename: string | null
}

const DossierContext = createContext<DossierContextValue | null>(null)

const SEQUENCE = [
  'ACCESSING PERSONNEL FILE...',
  'VERIFYING CLEARANCE...',
  'DECRYPTING RECORD...',
  'ACCESS GRANTED.',
] as const

export function DossierProvider({ children }: { children: ReactNode }) {
  const [activeCodename, setActiveCodename] = useState<string | null>(null)

  const open = useCallback((codename: string) => {
    playSound('dossier')
    setActiveCodename(codename)
  }, [])
  const close = useCallback(() => setActiveCodename(null), [])

  const value = useMemo(() => ({ open, close, activeCodename }), [open, close, activeCodename])

  return (
    <DossierContext.Provider value={value}>
      {children}
      <DossierAccess />
    </DossierContext.Provider>
  )
}

/** Optional access — components outside the provider simply get no-ops. */
export function useDossier() {
  const ctx = useContext(DossierContext)
  const reduce = useReducedMotion()

  const open = useCallback(
    (codename: string) => {
      if (ctx) {
        ctx.open(codename)
        return
      }
      // Fallback: scroll to the card in the operatives grid.
      const cards = Array.from(document.querySelectorAll<HTMLElement>('#operatives article'))
      const target = cards.find((card) => card.querySelector('h3')?.textContent.trim() === codename)
      target?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
      target?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true })
    },
    [ctx, reduce],
  )

  return { open, close: ctx?.close ?? (() => {}), activeCodename: ctx?.activeCodename ?? null }
}

function DossierAccess() {
  const { activeCodename, close } = useDossier()
  const reduce = useReducedMotion()
  const [step, setStep] = useState(0)
  const [granted, setGranted] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  const operative = activeCodename
    ? activeOperatives.find((entry) => entry.codename === activeCodename)
    : undefined

  // Drive the sequence, then reveal. Reduced motion skips it entirely.
  useEffect(() => {
    if (!activeCodename) return
    if (reduce) {
      setStep(SEQUENCE.length - 1)
      setGranted(true)
      return
    }
    setStep(0)
    setGranted(false)
    const timers: number[] = []
    SEQUENCE.forEach((_, index) => {
      timers.push(
        window.setTimeout(() => {
          setStep(index)
          playSound('terminal')
        }, index * 380),
      )
    })
    timers.push(
      window.setTimeout(() => {
        setGranted(true)
        playSound('confirm')
      }, SEQUENCE.length * 380),
    )
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [activeCodename, reduce])

  // Focus management + escape + scroll lock while the record is open.
  useEffect(() => {
    if (!activeCodename) {
      restoreRef.current?.focus({ preventScroll: true })
      restoreRef.current = null
      return
    }
    restoreRef.current = document.activeElement as HTMLElement | null
    document.body.classList.add('is-locked')
    const id = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 120)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      if (event.key !== 'Tab') return
      // Simple focus trap — the overlay only owns a handful of controls.
      const focusables = Array.from(
        document.querySelectorAll<HTMLElement>('#dossier-access a[href], #dossier-access button'),
      ).filter((el) => !el.hasAttribute('disabled'))
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener('keydown', onKey)
      document.body.classList.remove('is-locked')
    }
  }, [activeCodename, close])

  const history = operative ? missionHistory(operative) : []

  return (
    <AnimatePresence>
      {operative && (
        <motion.div
          id="dossier-access"
          className="fixed inset-0 z-[190] flex items-center justify-center bg-black/94 p-4 backdrop-blur-md sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.4 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dossier-access-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) close()
          }}
        >
          <motion.div
            className="relative w-full max-w-2xl overflow-hidden border border-neon/25 bg-void"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: reduce ? 0 : 0.55, ease: EASE_OUT_EXPO }}
          >
            <HudFrame />
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close dossier"
              className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center border border-line text-mute transition-colors hover:border-neon hover:text-neon"
            >
              <X size={14} aria-hidden="true" />
            </button>

            {/* ── access terminal ── */}
            <div className="relative border-b border-line-soft px-4 py-4 sm:px-6">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse-dot" aria-hidden="true" />
                <span className="font-tech text-[0.6rem] tracking-[0.22em] text-neon">
                  PERSONNEL FILE // {operative.number}
                </span>
                <span className="font-tech ml-auto text-[0.55rem] tracking-[0.2em] text-mute/60">
                  VISUAL SEQUENCE ONLY
                </span>
              </div>

              <ul className="mt-3 space-y-1" aria-live="polite">
                {SEQUENCE.map((line, index) => {
                  const visible = index <= step
                  const isLast = index === SEQUENCE.length - 1
                  return (
                    <li
                      key={line}
                      className={cn(
                        'font-tech flex items-center gap-2 text-[0.62rem] tracking-[0.16em] transition-opacity duration-300 sm:text-[0.68rem]',
                        visible ? 'opacity-100' : 'opacity-0',
                        isLast ? 'text-neon' : 'text-mute/80',
                      )}
                    >
                      <span aria-hidden="true" className={isLast ? 'text-neon' : 'text-emerald/70'}>
                        {visible && index <= step ? (index < step || isLast ? '✓' : '▸') : '·'}
                      </span>
                      {line}
                      {index === step && !isLast && !reduce && (
                        <span className="inline-block h-3 w-[5px] bg-neon/80 animate-blink" aria-hidden="true" />
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* ── revealed record ── */}
            <AnimatePresence>
              {granted && (
                <motion.div
                  className="relative"
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduce ? 0 : 0.6, ease: EASE_OUT_EXPO }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-[168px_1fr]">
                    <div className="relative hidden overflow-hidden border-b border-r border-line-soft bg-black sm:block">
                      <img
                        src={`${operative.image.base}-420.webp`}
                        alt={operative.image.alt}
                        width={420}
                        height={525}
                        className="h-full w-full object-cover opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent" />
                    </div>

                    <div className="p-4 sm:p-6">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={11} className="text-emerald" aria-hidden="true" />
                        <span className="font-tech text-[0.55rem] tracking-[0.2em] text-emerald">
                          RECORD DECLASSIFIED
                        </span>
                      </div>

                      <h3
                        id="dossier-access-title"
                        className="font-display mt-2 text-[clamp(1.6rem,6vw,2.3rem)] font-medium uppercase leading-none tracking-[-0.03em] text-bone"
                      >
                        {operative.codename}
                      </h3>
                      <p className="font-tech mt-1.5 text-[0.6rem] tracking-[0.2em] text-mute/75">
                        {operative.designation} // {operative.role}
                      </p>
                      <p className="font-tech mt-0.5 text-[0.6rem] tracking-[0.18em] text-mute/60">
                        {operative.fullName}
                      </p>

                      <p className="mt-3 text-[0.78rem] leading-relaxed text-mute">{operative.profile}</p>

                      <div className="mt-4 border-t border-line-soft pt-3">
                        <div className="flex items-center gap-2">
                          <span className="font-tech text-[0.55rem] tracking-[0.2em] text-neon/70">
                            MISSION HISTORY
                          </span>
                          <span className="h-px flex-1 bg-line-soft" aria-hidden="true" />
                          <span className="font-tech text-[0.55rem] tracking-[0.16em] text-mute/50">
                            {String(history.length).padStart(2, '0')} CONFIRMED
                          </span>
                        </div>
                        <ul className="mt-2 space-y-1">
                          {history.map((record) => (
                            <li key={record.id} className="flex flex-wrap items-baseline gap-x-2">
                              <span className="font-tech text-[0.55rem] tracking-[0.16em] text-mute/50">
                                [{record.number}]
                              </span>
                              <span className="font-tech flex-1 text-[0.6rem] tracking-[0.1em] text-bone/85">
                                {record.title}
                              </span>
                              <span
                                className={cn(
                                  'font-tech text-[0.55rem] tracking-[0.16em]',
                                  record.active ? 'text-neon' : 'text-emerald',
                                )}
                              >
                                {statusDisplay[record.status].label}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 border-t border-line-soft px-4 py-3 sm:px-6">
                    <Fingerprint size={11} className="text-neon/70" aria-hidden="true" />
                    <p className="font-tech flex-1 text-[0.55rem] leading-relaxed tracking-[0.14em] text-mute/55">
                      SIMULATED ACCESS SEQUENCE // This animation is atmosphere. It grants no access and
                      verifies no credentials.
                    </p>
                    <button
                      type="button"
                      onClick={close}
                      className="font-tech border border-line px-3 py-2 text-[0.6rem] tracking-[0.18em] text-bone transition-colors hover:border-neon/60 hover:text-neon"
                    >
                      CLOSE RECORD
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export type { Operative }
