import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronDown, Lock, Radio } from 'lucide-react'

import { transmissions, transmissionCopy, type Transmission } from '../data/intel'
import { archive, statusDisplay } from '../data/missions'
import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'
import { playSound } from '../lib/audio'
import { SectionHeading } from '../components/SectionHeading'
import { Reveal } from '../components/Reveal'
import { StatusPill } from '../components/StatusPill'

export function Transmissions() {
  const [open, setOpen] = useState<string | null>(transmissions[0]?.id ?? null)

  return (
    <section
      id="transmissions"
      aria-labelledby="transmissions-heading"
      className="relative overflow-hidden border-t border-line-soft bg-abyss py-24 sm:py-32 lg:py-40"
    >
      <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden="true">
        <div className="absolute inset-0 grid-bg opacity-25" />
        <div className="absolute left-0 top-1/3 h-[24rem] w-[min(32rem,90vw)] rounded-full bg-emerald/[0.045] blur-[130px]" />
      </div>

      <div className="container-x relative z-10">
        <SectionHeading
          id="transmissions-heading"
          index="03.5"
          label={transmissionCopy.label}
          lines={transmissionCopy.heading}
          aside={
            <span className="font-tech ml-auto hidden items-center gap-2 text-[0.7rem] tracking-[0.22em] text-mute/70 md:flex">
              <Lock size={9} aria-hidden="true" />
              CHANNEL // ENCRYPTED
            </span>
          }
        >
          <Reveal delay={0.2}>
            <p className="text-[0.95rem] leading-relaxed text-mute">{transmissionCopy.support}</p>
          </Reveal>
        </SectionHeading>

        <div className="mt-12 border border-line-soft bg-black/50 sm:mt-16">
          {/* channel header */}
          <div className="flex flex-wrap items-center gap-2 border-b border-neon/20 bg-neon/[0.04] px-3 py-2.5 sm:px-4">
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-neon animate-pulse-dot" />
            </span>
            <span className="font-tech text-[0.55rem] tracking-[0.2em] text-neon sm:text-[0.6rem]">
              {transmissionCopy.opening}
            </span>
            <span className="font-tech ml-auto text-[0.5rem] tracking-[0.18em] text-mute/50">
              SIMULATED // {transmissions.length} MESSAGES
            </span>
          </div>

          <ul>
            {transmissions.map((transmission, index) => (
              <TransmissionRow
                key={transmission.id}
                transmission={transmission}
                index={index}
                isOpen={open === transmission.id}
                onToggle={() => {
                  playSound('transmission')
                  setOpen((current) => (current === transmission.id ? null : transmission.id))
                }}
              />
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line-soft px-3 py-2.5 sm:px-4">
            <span className="font-tech text-[0.55rem] tracking-[0.2em] text-mute/60">
              {transmissionCopy.closing}
            </span>
            <span className="font-tech text-[0.5rem] tracking-[0.18em] text-mute/40">FICTIONAL ARCHIVE</span>
          </div>
        </div>

        <Reveal delay={0.1} className="mt-5">
          <p className="font-tech flex items-start gap-2 border-l border-line px-3 text-[0.55rem] leading-relaxed tracking-[0.14em] text-mute/50">
            <Radio size={10} className="mt-0.5 shrink-0 text-neon/40" aria-hidden="true" />
            {transmissionCopy.fictionalNotice}
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function TransmissionRow({
  transmission,
  index,
  isOpen,
  onToggle,
}: {
  transmission: Transmission
  index: number
  isOpen: boolean
  onToggle: () => void
}) {
  const reduce = useReducedMotion()
  const mission = transmission.missionId
    ? archive.find((entry) => entry.id === transmission.missionId)
    : null
  const status = mission ? statusDisplay[mission.status] : null

  return (
    <li className="border-b border-line-soft last:border-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="group flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-neon/[0.03] sm:px-4"
      >
        <span className="font-tech mt-0.5 shrink-0 text-[0.52rem] tracking-[0.16em] text-mute/40">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="min-w-0 flex-1">
          <span className="font-tech flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.5rem] tracking-[0.16em] text-mute/50">
            <span className="text-neon/70">{transmission.channel}</span>
            <span aria-hidden="true">//</span>
            <span>{transmission.origin}</span>
          </span>
          <span className="font-tech mt-1 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'text-[0.6rem] tracking-[0.14em] sm:text-[0.66rem]',
                isOpen ? 'text-neon' : 'text-bone/90 group-hover:text-bone',
              )}
            >
              {transmission.subject}
            </span>
            {transmission.encrypted && (
              <span className="font-tech inline-flex items-center gap-1 border border-line px-1.5 py-0.5 text-[0.45rem] tracking-[0.14em] text-mute/60">
                <Lock size={6} aria-hidden="true" />
                ENCRYPTED
              </span>
            )}
            {status && (
              <span
                className={cn(
                  'font-tech text-[0.45rem] tracking-[0.14em]',
                  status.active ? 'text-neon' : 'text-emerald',
                )}
              >
                {mission?.title} · {status.label}
              </span>
            )}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <span className="font-tech text-[0.45rem] tracking-[0.14em] text-mute/40">
            {transmission.time ?? transmissionCopy.timeUnknown}
          </span>
          <ChevronDown
            size={12}
            className={cn('text-mute/50 transition-transform duration-400', isOpen && 'rotate-180 text-neon')}
            aria-hidden="true"
          />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.5, ease: EASE_OUT_EXPO }}
            className="overflow-hidden"
          >
            <div className="border-t border-line-soft/60 bg-void/40 px-3 py-3 sm:px-4 sm:pl-11">
              {transmission.body.map((line, i) => (
                <p
                  key={line}
                  className="font-tech mb-1.5 flex gap-2 text-[0.6rem] leading-relaxed tracking-[0.1em] text-mute last:mb-0 sm:text-[0.64rem]"
                  style={reduce ? undefined : { animation: `gp-type-reveal 0.4s var(--ease-out-expo) ${i * 0.12}s both` }}
                >
                  <span className="shrink-0 text-neon/50" aria-hidden="true">
                    ›
                  </span>
                  <span>{line}</span>
                </p>
              ))}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {status && <StatusPill tone={status.active ? 'online' : 'complete'}>{status.label}</StatusPill>}
                <span className="font-tech text-[0.45rem] tracking-[0.16em] text-mute/40">
                  SIMULATED TRANSMISSION // NOT A REAL COMMUNICATION
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}
