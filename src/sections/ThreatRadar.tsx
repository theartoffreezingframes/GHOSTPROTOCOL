import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Pause, Play, Radar } from 'lucide-react'

import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'
import { SectionHeading } from '../components/SectionHeading'
import { Reveal } from '../components/Reveal'

/**
 * GLOBAL THREAT RADAR — a fictional simulation.
 *
 * Nothing is scanned, measured or transmitted. Every "signal" below is
 * a hard-coded fictional contact rendered with CSS transforms. The
 * component says so on the panel itself.
 */

type Contact = {
  id: string
  /** Degrees, clockwise from 12 o'clock. */
  angle: number
  /** Percentage of the radius, 0–1. */
  radius: number
  label: string
}

const CONTACTS: Contact[] = [
  { id: 'SIG-0416', angle: 38, radius: 0.62, label: 'UNKNOWN TRANSMISSION' },
  { id: 'SIG-0197', angle: 143, radius: 0.38, label: 'ENCRYPTED BURST' },
  { id: 'SIG-0822', angle: 217, radius: 0.78, label: 'RELAY ECHO' },
  { id: 'SIG-0054', angle: 296, radius: 0.52, label: 'CARRIER DETECTED' },
  { id: 'SIG-0733', angle: 331, radius: 0.24, label: 'SHORT PULSE' },
]

const MESSAGES = [
  'RADAR SYSTEM ONLINE',
  'SCANNING FREQUENCIES...',
  'NETWORK ACTIVITY SIMULATED',
  'SIGNAL DETECTED',
]

export function ThreatRadar() {
  const reduce = useReducedMotion()
  const [running, setRunning] = useState(!reduce)
  const [message, setMessage] = useState(0)
  const [visible, setVisible] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const [visibleContacts, setVisibleContacts] = useState<string[]>([])
  const wrapRef = useRef<HTMLDivElement>(null)

  // Only animate while the panel is on screen.
  useEffect(() => {
    const node = wrapRef.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: '0px',
      threshold: 0.05,
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Cycle the status line.
  useEffect(() => {
    if (!visible || reduce) return
    const id = window.setInterval(() => setMessage((current) => (current + 1) % MESSAGES.length), 3800)
    return () => window.clearInterval(id)
  }, [visible, reduce])

  // Contacts fade in and out on a slow loop — the "detected / lost" rhythm.
  useEffect(() => {
    if (reduce) {
      setVisibleContacts(CONTACTS.map((contact) => contact.id))
      return
    }
    let cancelled = false
    const tick = () => {
      if (cancelled) return
      const count = 2 + Math.floor(Math.random() * 3)
      const shuffled = [...CONTACTS].sort(() => Math.random() - 0.5).slice(0, count)
      setVisibleContacts(shuffled.map((contact) => contact.id))
    }
    tick()
    const id = window.setInterval(tick, 4200)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [reduce])

  const points = useMemo(
    () =>
      CONTACTS.map((contact) => {
        const radians = ((contact.angle - 90) * Math.PI) / 180
        return {
          ...contact,
          x: 50 + Math.cos(radians) * contact.radius * 46,
          y: 50 + Math.sin(radians) * contact.radius * 46,
        }
      }),
    [],
  )

  const sweeping = running && visible && !reduce

  return (
    <section
      id="radar"
      aria-labelledby="radar-heading"
      className="relative overflow-hidden border-t border-line-soft bg-void py-24 sm:py-32 lg:py-40"
    >
      <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden="true">
        <div className="absolute right-0 top-1/4 h-[26rem] w-[min(30rem,90vw)] rounded-full bg-emerald/[0.04] blur-[120px]" />
      </div>

      <div className="container-x relative z-10">
        <SectionHeading
          id="radar-heading"
          index="05.5"
          label="GLOBAL THREAT RADAR"
          lines={['THE SIGNAL', 'BEHIND THE NOISE.']}
          aside={
            <span className="font-tech ml-auto hidden items-center gap-2 text-[0.7rem] tracking-[0.22em] text-mute/70 md:flex">
              <Radar size={9} aria-hidden="true" />
              SIMULATION // NO LIVE SCANNING
            </span>
          }
        >
          <Reveal delay={0.2}>
            <p className="text-[0.95rem] leading-relaxed text-mute">
              A fictional tactical display, built as interface atmosphere. It scans nothing, measures nothing
              and reports on no real network.
            </p>
          </Reveal>
        </SectionHeading>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:mt-16 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* radar */}
          <div
            ref={wrapRef}
            className="relative overflow-hidden border border-line-soft bg-black"
            aria-hidden="false"
          >
            <div className="flex items-center justify-between border-b border-line-soft px-3 py-2">
              <span className="font-tech text-[0.55rem] tracking-[0.2em] text-mute/60">
                SECTOR // ALL // RANGE 12
              </span>
              <button
                type="button"
                onClick={() => setRunning((value) => !value)}
                className="font-tech flex items-center gap-1.5 border border-line px-2 py-1 text-[0.55rem] tracking-[0.16em] text-bone transition-colors hover:border-neon/50 hover:text-neon"
                aria-pressed={running}
              >
                {sweeping ? <Pause size={9} aria-hidden="true" /> : <Play size={9} aria-hidden="true" />}
                {sweeping ? 'PAUSE SWEEP' : 'RESUME SWEEP'}
              </button>
            </div>

            <div className="relative mx-auto aspect-square w-full max-w-[560px] p-4 sm:p-6">
              {/* rings */}
              <div className="absolute inset-4 rounded-full border border-neon/20 sm:inset-6" aria-hidden="true" />
              <div className="absolute inset-[18%] rounded-full border border-neon/12" aria-hidden="true" />
              <div className="absolute inset-[32%] rounded-full border border-neon/10" aria-hidden="true" />
              <div className="absolute inset-[46%] rounded-full border border-neon/10" aria-hidden="true" />
              {/* cross hairs */}
              <div className="absolute inset-4 sm:inset-6" aria-hidden="true">
                <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-neon/[0.08]" />
                <div className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-neon/[0.08]" />
                <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 rotate-45 bg-neon/[0.05]" />
                <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 -rotate-45 bg-neon/[0.05]" />
              </div>

              {/* sweep */}
              {sweeping && (
                <div className="absolute inset-4 sm:inset-6" aria-hidden="true">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        'conic-gradient(from 0deg, rgba(57,255,20,0.28) 0deg, rgba(57,255,20,0.05) 28deg, transparent 60deg, transparent 360deg)',
                      animation: 'gp-radar 4.6s linear infinite',
                    }}
                  />
                  <div
                    className="absolute left-1/2 top-1/2 h-px w-1/2 origin-left"
                    style={{
                      background: 'linear-gradient(to right, rgba(57,255,20,0.9), rgba(57,255,20,0))',
                      animation: 'gp-radar 4.6s linear infinite',
                      transform: 'rotate(0deg)',
                      transformOrigin: '0% 50%',
                    }}
                  />
                </div>
              )}

              {/* contacts */}
              {points.map((point) => {
                const shown = visibleContacts.includes(point.id)
                const isActive = active === point.id
                return (
                  <div
                    key={point.id}
                    className="absolute"
                    style={{ left: `${point.x}%`, top: `${point.y}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    <button
                      type="button"
                      onMouseEnter={() => setActive(point.id)}
                      onMouseLeave={() => setActive(null)}
                      onFocus={() => setActive(point.id)}
                      onBlur={() => setActive(null)}
                      onClick={() => setActive((current) => (current === point.id ? null : point.id))}
                      aria-label={`Fictional signal ${point.id}`}
                      className={cn(
                        'relative flex h-6 w-6 items-center justify-center transition-opacity duration-700',
                        shown ? 'opacity-100' : 'opacity-0 pointer-events-none',
                      )}
                    >
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          isActive ? 'bg-neon' : 'bg-neon/80',
                          !reduce && shown && 'animate-pulse-dot',
                        )}
                      />
                      {isActive && (
                        <motion.span
                          layoutId="radar-target"
                          className="absolute inset-0 rounded-full border border-neon/60"
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: reduce ? 0 : 0.3, ease: EASE_OUT_EXPO }}
                        />
                      )}
                    </button>
                  </div>
                )
              })}

              {/* centre */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
                <span className="block h-2 w-2 rounded-full bg-neon/70 shadow-[0_0_18px_2px_rgba(57,255,20,0.4)]" />
              </div>

              {/* coordinate ticks */}
              <div className="font-tech pointer-events-none absolute inset-0 text-[0.45rem] tracking-[0.14em] text-mute/35">
                <span className="absolute left-1/2 top-1 -translate-x-1/2">000</span>
                <span className="absolute right-1 top-1/2 -translate-y-1/2">090</span>
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2">180</span>
                <span className="absolute left-1 top-1/2 -translate-y-1/2">270</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line-soft px-3 py-2">
              <span className="font-tech flex items-center gap-2 text-[0.55rem] tracking-[0.18em] text-neon">
                <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-neon animate-pulse-dot" />
                </span>
                {reduce ? 'RADAR SYSTEM ONLINE' : MESSAGES[message]}
              </span>
              <span className="font-tech text-[0.52rem] tracking-[0.16em] text-mute/50">
                TRACKS // {String(visibleContacts.length).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* readouts */}
          <div className="flex flex-col gap-3">
            <div className="border border-line-soft bg-card/40 p-4">
              <p className="font-tech text-[0.55rem] tracking-[0.2em] text-mute/60">CONTACT LOG</p>
              <ul className="mt-2 space-y-1.5">
                {points.map((point) => {
                  const shown = visibleContacts.includes(point.id)
                  const isActive = active === point.id
                  return (
                    <li
                      key={point.id}
                      className={cn(
                        'flex items-baseline justify-between gap-2 border-b border-line-soft/60 pb-1.5 last:border-0',
                        'transition-opacity duration-500',
                        shown ? 'opacity-100' : 'opacity-40',
                      )}
                    >
                      <button
                        type="button"
                        onMouseEnter={() => setActive(point.id)}
                        onMouseLeave={() => setActive(null)}
                        onClick={() => setActive((current) => (current === point.id ? null : point.id))}
                        className={cn(
                          'font-tech text-left text-[0.55rem] tracking-[0.14em] transition-colors',
                          isActive ? 'text-neon' : 'text-bone/80 hover:text-neon',
                        )}
                      >
                        {point.id}
                      </button>
                      <span className="font-tech text-[0.5rem] tracking-[0.12em] text-mute/50">
                        {isActive ? point.label : shown ? 'TRACKING' : 'LOST'}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="border border-line-soft bg-card/40 p-4">
              <div className="flex items-center justify-between">
                <p className="font-tech text-[0.55rem] tracking-[0.2em] text-mute/60">SYSTEM</p>
                <span className="font-tech text-[0.55rem] tracking-[0.16em] text-neon">ONLINE</span>
              </div>
              <dl className="mt-2 space-y-1.5">
                {[
                  { label: 'MODE', value: 'SIMULATION' },
                  { label: 'SWEEP', value: sweeping ? 'ACTIVE' : 'HELD' },
                  { label: 'CONTACTS', value: String(visibleContacts.length).padStart(2, '0') },
                  { label: 'INFERENCE', value: 'NONE' },
                ].map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-2">
                    <dt className="font-tech text-[0.52rem] tracking-[0.14em] text-mute/50">{row.label}</dt>
                    <dd className="font-tech text-[0.55rem] tracking-[0.14em] text-bone/80">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <p className="font-tech border border-line-soft bg-black/40 p-3 text-[0.52rem] leading-relaxed tracking-[0.12em] text-mute/50">
              FICTIONAL DISPLAY // No network scanning, address collection, visitor monitoring or threat
              detection takes place. Contacts are decorative.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
