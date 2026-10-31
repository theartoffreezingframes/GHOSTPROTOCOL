import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import { AlertTriangle, Fingerprint, Lock, Radio, X } from 'lucide-react'

import { blackoutCopy, statusDisplay, type Mission } from '../data/missions'
import { activeOperatives } from '../data/team'
import { imageFallback, imageSrcSet } from '../lib/media'
import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'
import { GlitchText } from '../components/GlitchText'
import { HudFrame } from '../components/HudFrame'
import { Magnetic } from '../components/Magnetic'
import { MaskedLines } from '../components/MaskedLines'
import { DecodeLabel } from '../components/DecodeLabel'

/**
 * OPERATION BLACKOUT — the live, classified mission.
 * A near-black classified file: glitching typography, signal
 * interference, warning telemetry and an encrypted-file reveal.
 *
 * Every status label comes from the mission record, so flipping
 * `status` in src/data/missions.ts re-labels the whole tile.
 */
export function BlackoutMission({ mission }: { mission: Mission }) {
  const reduce = useReducedMotion()
  const status = statusDisplay[mission.status]
  const statusRows = blackoutCopy.status(mission)
  const assigned = activeOperatives.filter((operative) => operative.missions.includes(mission.id))
  const assignedLabel = assigned.map((operative) => operative.codename).join(' · ')
  const [decrypted, setDecrypted] = useState(false)
  const [granted, setGranted] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])
  const glow = useTransform(scrollYProgress, [0, 0.5, 1], [0.25, 0.85, 0.25])

  // Signal interference: short random drop-outs, never constant.
  const [interference, setInterference] = useState(false)
  useEffect(() => {
    if (reduce) return
    let t: number
    const schedule = () => {
      t = window.setTimeout(() => {
        setInterference(true)
        window.setTimeout(() => setInterference(false), 180 + Math.random() * 220)
        schedule()
      }, 6000 + Math.random() * 7000)
    }
    schedule()
    return () => window.clearTimeout(t)
  }, [reduce])

  const ctaRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  const open = () => {
    setDecrypted(true)
    window.setTimeout(() => setGranted(true), 1250)
  }

  const close = () => {
    setDecrypted(false)
    setGranted(false)
    window.setTimeout(() => ctaRef.current?.focus({ preventScroll: true }), 60)
  }

  // Keyboard: Esc always closes, focus moves into the sealed file.
  useEffect(() => {
    if (!decrypted) return
    const focusId = window.setTimeout(
      () => dialogRef.current?.querySelector<HTMLElement>('button')?.focus({ preventScroll: true }),
      140,
    )
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(focusId)
      window.removeEventListener('keydown', onKey)
    }
  }, [decrypted])

  return (
    <div ref={sectionRef} className="relative mt-16 sm:mt-24">
      {/* transition bleed from the archive above */}
      <div className="pointer-events-none absolute inset-x-0 -top-16 h-32 bg-gradient-to-b from-transparent to-void" aria-hidden="true" />

      <motion.article
        id="operation-blackout"
        data-mission-id={mission.id}
        className="relative overflow-hidden border border-neon/25 bg-black"
        initial={reduce ? false : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 'some', margin: '160% 0px 15% 0px' }}
        transition={{ duration: 1.2, ease: EASE_OUT_EXPO }}
        aria-labelledby="blackout-heading"
      >
        {/* ── background: near-total black with one green slit ── */}
        <div className="absolute inset-0" aria-hidden="true">
          <motion.div className="absolute inset-0" style={reduce ? undefined : { y: imageY }}>
            <img
              src={imageFallback(mission.image!)}
              srcSet={imageSrcSet(mission.image!)}
              sizes="100vw"
              alt=""
              loading="lazy"
              decoding="async"
              width={2100}
              height={919}
              className="h-full w-full scale-105 object-cover object-center opacity-[0.85] brightness-[1.2]"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/45" />
          <div className="absolute inset-0 bg-black/25" />
          <motion.div
            className="absolute left-1/2 top-1/2 h-[42rem] w-[min(42rem,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
            style={{
              background: 'radial-gradient(circle, rgba(57,255,20,0.16), transparent 68%)',
              opacity: reduce ? 0.4 : glow,
            }}
          />
          <div className="absolute inset-0 grid-bg opacity-30" />
          {/* scan line */}
          <div className="absolute inset-x-0 h-[30%] bg-gradient-to-b from-transparent via-neon/[0.04] to-transparent animate-scanline" />
          {/* interference flash */}
          <AnimatePresence>
            {interference && (
              <motion.div
                className="absolute inset-0 bg-neon/[0.045]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                <div className="absolute inset-x-0 top-1/3 h-px bg-neon/50" />
                <div className="absolute inset-x-0 bottom-1/4 h-px bg-neon/30" />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute inset-0 noise-overlay opacity-[0.5] mix-blend-soft-light" />
        </div>

        {/* ── frame corners ── */}
        <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
          <div className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-neon" />
          <div className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-neon" />
          <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-neon" />
          <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-neon" />
        </div>

        {/* ── top status bar ── */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b border-neon/20 bg-black/60 px-4 py-3 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-neon animate-pulse-dot" />
            </span>
            <span className="font-tech text-[0.66rem] tracking-[0.24em] text-neon sm:text-[0.7rem]">
              {status.active ? 'ACTIVE OPERATION' : 'INCOMING OPERATION'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-tech flex items-center gap-1.5 text-[0.7rem] tracking-[0.18em] text-mute/80 sm:text-[0.66rem]">
              <Radio size={9} aria-hidden="true" />
              {status.active ? 'SIGNAL OPEN · LIVE FEED' : 'SIGNAL LOST · RECONNECTING'}
            </span>
            <span className="font-tech hidden text-[0.7rem] tracking-[0.18em] text-mute/75 sm:inline">
              CH // <DecodeLabel value="0xB1A0" />
            </span>
            <span className="font-tech flex items-center gap-1.5 border border-neon/30 px-2 py-0.5 text-[0.7rem] tracking-[0.18em] text-neon">
              <AlertTriangle size={8} aria-hidden="true" />
              CLASSIFIED
            </span>
          </div>
        </div>

        {/* ── main composition ── */}
        <div className="relative z-20 grid grid-cols-1 gap-10 px-4 py-12 sm:px-8 sm:py-16 lg:grid-cols-12 lg:gap-8 lg:px-12 lg:py-24">
          <div className="lg:col-span-8">
            <motion.div
              className="mb-5 flex items-center gap-3"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 'some', margin: '160% 0px 15% 0px' }}
              transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
            >
              <span className="font-tech text-[0.7rem] tracking-[0.28em] text-neon">{mission.number}</span>
              <span className="font-tech text-[0.7rem] tracking-[0.28em] text-mute/75" aria-hidden="true">
                //
              </span>
              <span className="font-tech text-[0.7rem] tracking-[0.28em] text-mute">
                {status.active ? 'ACTIVE FILE' : 'SEALED FILE'}
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-neon/40 to-transparent" aria-hidden="true" />
            </motion.div>

            <MaskedLines
              lines={blackoutCopy.headline}
              as="h2"
              className="font-display text-[clamp(1.9rem,5vw,3.4rem)] font-medium uppercase leading-[0.92] tracking-[-0.04em] text-bone/85"
              amount="some"
              id="blackout-heading"
            />

            {/* glitching operation name */}
            {/* scroll trigger sits on the wrapper: the translated line itself
                reports zero intersection while masked, which would stall it */}
            <motion.div
              className="mt-4 overflow-hidden sm:mt-6"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 'some', margin: '160% 0px 15% 0px' }}
            >
              <motion.div
                className="font-display select-none text-[clamp(3.2rem,13.5vw,10rem)] font-medium uppercase leading-[0.82] tracking-[-0.055em] text-neon text-glow"
                variants={{
                  hidden: reduce ? { opacity: 1, y: '0%' } : { y: '104%', opacity: 0 },
                  show: {
                    y: '0%',
                    opacity: 1,
                    transition: { duration: reduce ? 0 : 1.25, ease: EASE_OUT_EXPO, delay: reduce ? 0 : 0.1 },
                  },
                }}
              >
                <GlitchText ambient={!reduce}>{blackoutCopy.glitchWord}</GlitchText>
              </motion.div>
            </motion.div>

            <div className="mt-7 max-w-lg space-y-1.5">
              {blackoutCopy.support.map((line, i) => (
                <motion.p
                  key={line}
                  className="font-tech text-[0.72rem] tracking-[0.2em] text-bone/70"
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 'some', margin: '160% 0px 15% 0px' }}
                  transition={{ duration: 0.7, delay: 0.15 + i * 0.09, ease: EASE_OUT_EXPO }}
                >
                  {line}
                </motion.p>
              ))}
            </div>

            <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Magnetic strength={9}>
                <button
                  ref={ctaRef}
                  type="button"
                  onClick={open}
                  className={cn(
                    'group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden border border-neon bg-neon px-6 py-4 font-tech text-[0.7rem] tracking-[0.2em] text-black transition-all duration-500 sm:w-auto sm:text-[0.72rem]',
                    'hover:shadow-[0_0_40px_-8px_rgba(57,255,20,0.65)]',
                  )}
                >
                  <span className="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-700 group-hover:translate-x-full" aria-hidden="true" />
                  <Lock size={13} aria-hidden="true" />
                  {blackoutCopy.cta}
                </button>
              </Magnetic>
              <span className="font-tech text-[0.66rem] leading-relaxed tracking-[0.18em] text-mute/75">
                AUTHORIZATION REQUIRED
                <br />
                NO DETAILS ON RECORD
              </span>
            </div>
          </div>

          {/* status readout */}
          <div className="lg:col-span-4 lg:flex lg:flex-col lg:justify-end">
            <div className="relative border border-neon/20 bg-black/70 p-4 backdrop-blur-md sm:p-5">
              <HudFrame />
              <div className="mb-3 flex items-center justify-between">
                <span className="font-tech text-[0.66rem] tracking-[0.22em] text-mute">MISSION TELEMETRY</span>
                <span className="font-tech text-[0.7rem] tracking-[0.18em] text-neon/70">LIVE</span>
              </div>
              <dl className="space-y-2.5">
                {statusRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-3 border-b border-neon/10 pb-2 last:border-0 last:pb-0"
                  >
                    <dt className="font-tech text-[0.66rem] tracking-[0.18em] text-mute/80">{row.label}</dt>
                    <dd
                      className={cn(
                        'font-tech text-right text-[0.7rem] tracking-[0.16em]',
                        row.value === 'CLASSIFIED' || row.value === status.label ? 'text-neon' : 'text-bone/85',
                      )}
                    >
                      {row.value}
                    </dd>
                  </div>
                ))}

                {mission.operationType === 'SOLO' && (
                  <div className="mt-3 border-t border-neon/20 pt-3">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="font-tech text-[0.66rem] tracking-[0.18em] text-mute/80">MISSION TYPE</dt>
                      <dd className="font-tech text-[0.7rem] tracking-[0.16em] text-neon">SOLO OPERATION</dd>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <dt className="font-tech text-[0.66rem] tracking-[0.18em] text-mute/80">ASSIGNED OPERATIVE</dt>
                      <dd className="font-tech text-[0.7rem] tracking-[0.16em] text-bone/85">{assignedLabel || '—'}</dd>
                    </div>
                  </div>
                )}
              </dl>

              <div className="mt-4 flex items-center gap-2 border-t border-neon/10 pt-3">
                <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-neon animate-pulse-dot" />
                </span>
                <span className="font-tech text-[0.7rem] tracking-[0.18em] text-mute/75">
                  {status.active ? 'AWAITING AUTHORIZATION' : 'FIELD INACTIVE'}
                </span>
              </div>
            </div>

            <p className="font-tech mt-4 hidden text-[0.7rem] leading-relaxed tracking-[0.16em] text-mute/60 lg:block">
              {blackoutCopy.placeholder} // DATE, VENUE, OBJECTIVES AND RESULTS WILL BE DECLASSIFIED WHEN CLEARED.
            </p>
          </div>
        </div>

        {/* ── decrypted overlay ── */}
        <AnimatePresence>
          {decrypted && (
            <motion.div
              ref={dialogRef}
              className="absolute inset-0 z-40 flex items-center justify-center bg-black/92 p-5 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="blackout-dialog-title"
            >
              <button
                type="button"
                onClick={close}
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center border border-neon/30 text-mute transition-colors hover:border-neon hover:text-neon"
                aria-label="Close classified file"
              >
                <X size={14} aria-hidden="true" />
              </button>

              <div className="w-full max-w-xl text-center">
                <motion.div
                  className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border border-neon/40"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
                >
                  <Fingerprint size={22} className="text-neon" aria-hidden="true" />
                </motion.div>

                <div className="overflow-hidden">
                  <motion.h3
                    id="blackout-dialog-title"
                    className="font-display text-[clamp(1.15rem,4vw,1.85rem)] font-medium uppercase leading-tight tracking-[-0.02em] text-neon"
                    initial={reduce ? { opacity: 0 } : { y: '110%' }}
                    animate={reduce ? { opacity: 1 } : { y: '0%' }}
                    transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.15 }}
                  >
                    {blackoutCopy.encrypted[0]}
                  </motion.h3>
                </div>
                <motion.p
                  className="font-tech mt-3 text-[0.7rem] tracking-[0.24em] text-bone/80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  {blackoutCopy.encrypted[1]}
                </motion.p>

                {/* decryption progress */}
                <div className="mx-auto mt-7 h-px w-full max-w-sm overflow-hidden bg-line">
                  <motion.div
                    className="h-full bg-neon"
                    initial={{ width: '0%' }}
                    animate={{ width: granted ? '100%' : '72%' }}
                    transition={{ duration: granted ? 0.6 : 1.6, ease: EASE_OUT_EXPO, delay: 0.2 }}
                  />
                </div>
                <p className="font-tech mx-auto mt-2 flex w-full max-w-sm items-center justify-between text-[0.7rem] tracking-[0.18em] text-mute/75">
                  <span>DECRYPTION</span>
                  <span className="tabular-nums text-neon/80">{granted ? 'LOCKED' : 'INTERRUPTED'}</span>
                </p>

                <AnimatePresence>
                  {granted && (
                    <motion.p
                      className="font-tech mt-6 flex items-center justify-center gap-2 text-[0.66rem] tracking-[0.22em] text-bone/70"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <AlertTriangle size={9} className="text-neon/70" aria-hidden="true" />
                      AUTHORIZATION NOT PRESENT — FILE SEALED
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={close}
                  className="font-tech mt-8 inline-flex items-center gap-2 border border-line px-5 py-3 text-[0.7rem] tracking-[0.2em] text-bone transition-colors hover:border-neon/60 hover:text-neon"
                >
                  RETURN TO ARCHIVE
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── footer strip ── */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-t border-neon/20 bg-black/70 px-4 py-2.5 sm:px-6">
          <span className="font-tech text-[0.7rem] tracking-[0.2em] text-mute/75">
            {blackoutCopy.strip.file(mission)}
          </span>
          <span className="font-tech text-[0.7rem] tracking-[0.2em] text-neon/70">
            {blackoutCopy.strip.state(mission)}
          </span>
          <span className="font-tech hidden text-[0.7rem] tracking-[0.2em] text-mute/75 sm:inline">
            OPERATIVES ASSIGNED // {assignedLabel || '—'}
          </span>
        </div>
      </motion.article>
    </div>
  )
}
