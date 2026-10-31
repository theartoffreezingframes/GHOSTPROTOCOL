import { useId, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'
import { ArrowUpRight, Crosshair, Lock, Plus, ScanFace } from 'lucide-react'

import {
  activeOperatives,
  isSoloAssignment,
  missionHistory,
  missionHistoryCopy,
  operativeMeta,
  type Operative,
  type OperativeMissionRecord,
} from '../data/team'
import { imageFallback, imageSrcSet } from '../lib/media'
import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { HudFrame } from '../components/HudFrame'
import { StatusPill } from '../components/StatusPill'
import { useDossier } from '../components/DossierProvider'
import { playSound } from '../lib/audio'

const SIGNATURE_LABEL: Record<Operative['signature'], string> = {
  command: 'COMMAND',
  intelligence: 'INTEL',
  stealth: 'STEALTH',
  adaptive: 'ADAPT',
  emerging: 'EMERGING',
  analysis: 'ANALYSIS',
}

/** Per-signature image grade — keeps six portraits feeling like one shoot. */
const SIGNATURE_TREATMENT: Record<Operative['signature'], string> = {
  command: 'contrast-[1.06] saturate-[0.9] grayscale-[25%]',
  intelligence: 'contrast-[1.02] saturate-[1.05] grayscale-[30%]',
  stealth: 'brightness-[0.95] contrast-[1.08] grayscale-[35%]',
  adaptive: 'contrast-[1.03] saturate-[0.98] grayscale-[28%]',
  emerging: 'brightness-[1.02] contrast-[1.04] grayscale-[30%]',
  analysis: 'contrast-[1.05] saturate-[0.95] grayscale-[27%]',
}

const SOCIAL_ICON: Record<string, string> = {
  github: 'GH',
  linkedin: 'IN',
  instagram: 'IG',
  x: 'X',
  email: '@',
  website: '↗',
}

export function Operatives() {
  return (
    <section
      id="operatives"
      aria-labelledby="operatives-heading"
      className="relative overflow-hidden border-t border-line-soft bg-void py-24 sm:py-32 lg:py-40"
    >
      <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden="true">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon/25 to-transparent" />
        <div className="absolute left-1/2 top-24 h-[30rem] w-[70rem] -translate-x-1/2 rounded-[100%] bg-emerald/[0.045] blur-[120px]" />
      </div>

      <div className="container-x relative z-10">
        <SectionHeading
          id="operatives-heading"
          index="02"
          label={operativeMeta.label}
          lines={operativeMeta.heading}
          aside={
            <span className="font-tech ml-auto hidden items-center gap-2 text-[0.7rem] tracking-[0.22em] text-mute/70 md:flex">
              <Lock size={9} aria-hidden="true" />
              CLEARANCE // {operativeMeta.count} ACTIVE
            </span>
          }
        >
          <Reveal delay={0.2}>
            <p className="font-tech text-[0.78rem] leading-relaxed tracking-[0.14em] text-neon/80">
              {operativeMeta.support}
            </p>
            <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-mute">{operativeMeta.note}</p>
          </Reveal>
        </SectionHeading>

        {/* 1 → 2 → 3 up: six records read cleanly at every width */}
        <div className="mt-14 grid grid-cols-1 gap-5 sm:mt-20 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {activeOperatives.map((operative, index) => (
            <OperativeCard key={operative.number} operative={operative} index={index} />
          ))}
        </div>

        <Reveal delay={0.15} className="mt-10 flex items-center gap-3 border-t border-line-soft pt-6">
          <ScanFace size={13} className="shrink-0 text-neon/60" aria-hidden="true" />
          <p className="font-tech text-[0.7rem] leading-relaxed tracking-[0.18em] text-mute/70">
            {operativeMeta.dossierNote}
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function OperativeCard({ operative, index }: { operative: Operative; index: number }) {
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)
  const { open: openAccess } = useDossier()
  const cardRef = useRef<HTMLDivElement>(null)
  const id = useId()

  // pointer-driven tilt + spotlight
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(my, [0, 1], [4.5, -4.5]), { stiffness: 160, damping: 20 })
  const rotateY = useSpring(useTransform(mx, [0, 1], [-5.5, 5.5]), { stiffness: 160, damping: 20 })
  const spotlightX = useTransform(mx, (v) => `${(v * 100).toFixed(2)}%`)
  const spotlightY = useTransform(my, (v) => `${(v * 100).toFixed(2)}%`)
  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${spotlightX} ${spotlightY}, rgba(57,255,20,0.14), transparent 62%)`

  const treatment = SIGNATURE_TREATMENT[operative.signature]

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || event.pointerType === 'touch') return
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    mx.set((event.clientX - rect.left) / rect.width)
    my.set((event.clientY - rect.top) / rect.height)
  }

  const resetTilt = () => {
    mx.set(0.5)
    my.set(0.5)
  }

  return (
    <motion.article
      className="group relative"
      initial={reduce ? false : { opacity: 0, y: 42 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 'some', margin: '160% 0px 15% 0px' }}
      transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: index * 0.12 }}
    >
      <motion.div
        ref={cardRef}
        onPointerMove={onPointerMove}
        onPointerLeave={resetTilt}
        className={cn(
          'relative flex h-full flex-col overflow-hidden border border-line-soft bg-card/60 transition-colors duration-500',
          'hover:border-neon/30 focus-within:border-neon/40',
        )}
        style={
          reduce
            ? undefined
            : { rotateX, rotateY, transformPerspective: 1200, transformStyle: 'preserve-3d' }
        }
        data-signature={operative.signature}
      >
        {/* pointer spotlight */}
        {!reduce && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: spotlight }}
            aria-hidden="true"
          />
        )}

        {/* portrait */}
        <div className="relative aspect-[4/5] overflow-hidden bg-void">
          <img
            src={imageFallback(operative.image)}
            srcSet={imageSrcSet(operative.image)}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            alt={operative.image.alt}
            loading="lazy"
            decoding="async"
            width={1000}
            height={1250}
            className={cn(
              'h-full w-full scale-[1.02] object-cover transition-all duration-[1200ms] ease-out',
              'opacity-90 group-hover:scale-[1.07] group-hover:opacity-100 group-hover:grayscale-0',
              treatment,
            )}
          />
          {/* grade + scan treatment */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-void/45 to-transparent" />
          <div
            className="absolute inset-0 opacity-[0.5] mix-blend-overlay"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(0,0,0,0.42) 0px, rgba(0,0,0,0.42) 1px, transparent 1px, transparent 3px)',
            }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-emerald/[0.03] mix-blend-color" aria-hidden="true" />

          {/* reveal sweep on hover */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true">
            <div className="absolute inset-y-0 w-1/3 animate-sweep bg-gradient-to-r from-transparent via-neon/[0.09] to-transparent" />
          </div>

          <HudFrame labels={[`FRAME // ${operative.number}`, `${operative.role}`]} />

          {/* top metadata */}
          <div className="absolute inset-x-0 top-0 z-30 flex items-start justify-between p-4">
            <span className="font-tech text-[0.7rem] tracking-[0.24em] text-neon/90">
              OPERATIVE {operative.number}
            </span>
            <span className="font-tech flex items-center gap-1.5 text-[0.66rem] tracking-[0.2em] text-mute">
              <span className="h-1 w-1 rounded-full bg-neon animate-pulse-dot" aria-hidden="true" />
              ACTIVE
            </span>
          </div>

          {/* name lockup */}
          <div className="absolute inset-x-0 bottom-0 z-30 p-4 sm:p-5">
            <p className="font-tech mb-2 text-[0.7rem] tracking-[0.26em] text-bone/75">
              {operative.designation}
            </p>
            <h3
              className="font-display text-[clamp(2rem,5vw,2.9rem)] font-medium uppercase leading-[0.9] tracking-[-0.04em] text-bone"
              id={`${id}-name`}
            >
              {operative.codename}
            </h3>
            <div className="mt-3 flex items-center gap-3">
              <span className="h-px flex-1 bg-line" aria-hidden="true" />
              <span className="font-tech text-[0.66rem] tracking-[0.22em] text-mute">{operative.role}</span>
            </div>
          </div>
        </div>

        {/* dossier body */}
        <div className="relative z-30 flex flex-1 flex-col p-4 sm:p-5">
          <p className="font-tech text-[0.7rem] tracking-[0.22em] text-mute/70">FULL NAME</p>
          <p className="mt-1.5 text-[0.92rem] font-medium uppercase tracking-[0.05em] text-bone">
            {operative.fullName}
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {operative.traits.map((trait) => (
              <StatusPill key={trait} tone="muted">
                {trait}
              </StatusPill>
            ))}
          </div>

          <p className="mt-4 text-[0.82rem] leading-relaxed text-mute">{operative.brief}</p>

          {/* expandable full profile */}
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
                className="overflow-hidden"
                id={`${id}-detail`}
              >
                <div className="mt-4 border-t border-line-soft pt-4">
                  <p className="font-tech mb-2 text-[0.66rem] tracking-[0.22em] text-neon/70">PROFILE</p>
                  <p className="text-[0.8rem] leading-relaxed text-mute">{operative.profile}</p>

                  <MissionHistory operative={operative} />

                  <p className="font-tech mb-2 mt-4 text-[0.66rem] tracking-[0.22em] text-neon/70">CHARACTER PROFILE</p>
                  <ul className="space-y-1.5">
                    {operative.capabilities.map((capability) => (
                      <li key={capability} className="flex items-start gap-2 text-[0.78rem] leading-snug text-mute">
                        <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-neon/60" aria-hidden="true" />
                        {capability}
                      </li>
                    ))}
                  </ul>

                  <p className="font-tech mb-2 mt-4 text-[0.66rem] tracking-[0.22em] text-neon/70">TECHNICAL SKILLS</p>
                  {operative.skills.length > 0 ? (
                    <ul className="flex flex-wrap gap-1.5">
                      {operative.skills.map((skill) => (
                        <li key={skill}>
                          <StatusPill tone="online">{skill}</StatusPill>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="font-tech text-[0.66rem] tracking-[0.18em] text-mute/70">
                      NOT ON RECORD // AWAITING SUPPLY
                    </p>
                  )}

                  <p className="font-tech mb-2 mt-4 text-[0.66rem] tracking-[0.22em] text-neon/70">CHANNELS</p>
                  {operative.socials.length > 0 ? (
                    <ul className="flex flex-wrap gap-2">
                      {operative.socials.map((social) => (
                        <li key={social.platform}>
                          <a
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-tech inline-flex items-center gap-1.5 border border-line px-2 py-1 text-[0.66rem] tracking-[0.16em] text-bone transition-colors hover:border-neon/60 hover:text-neon"
                          >
                            <span aria-hidden="true">{SOCIAL_ICON[social.platform] ?? '↗'}</span>
                            {social.label}
                            <ArrowUpRight size={9} aria-hidden="true" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="font-tech text-[0.66rem] tracking-[0.18em] text-mute/70">
                      NO PUBLIC CHANNEL ON FILE
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-auto pt-4">
            <button
              type="button"
              onClick={() => {
                playSound('dossier')
                openAccess(operative.codename)
              }}
              className="font-tech mb-2 flex w-full items-center justify-between border border-neon/30 px-2.5 py-2 text-[0.62rem] tracking-[0.18em] text-neon transition-colors hover:bg-neon/10"
            >
              ACCESS FILE
              <Lock size={9} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => {
                playSound('terminal')
                setOpen((v) => !v)
              }}
              aria-expanded={open}
              {...(open ? { 'aria-controls': `${id}-detail` } : {})}
              className="font-tech group/btn flex w-full items-center justify-between border-t border-line-soft py-3 text-[0.7rem] tracking-[0.2em] text-mute transition-colors hover:text-neon focus-visible:text-neon"
            >
              {open ? 'CLOSE DOSSIER' : 'OPEN DOSSIER'}
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center border border-line transition-all duration-500 group-hover/btn:border-neon/60 group-hover/btn:bg-neon/10 group-focus-visible/btn:border-neon/60',
                  open && 'rotate-45',
                )}
              >
                <Plus size={10} aria-hidden="true" />
              </span>
            </button>
          </div>
        </div>

        {/* signature accent line */}
        <div
          className="absolute left-0 top-0 z-30 h-full w-[2px] origin-top scale-y-0 transition-transform duration-700 group-hover:scale-y-100"
          style={{ background: `linear-gradient(to bottom, transparent, ${operative.accent}, transparent)` }}
          aria-hidden="true"
        />
      </motion.div>

      {/* hover hint for command / intel / stealth */}
      <div className="pointer-events-none absolute -top-3 right-3 z-40 flex items-center gap-1.5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <Crosshair size={10} className="text-neon" aria-hidden="true" />
        <span className="font-tech text-[0.7rem] tracking-[0.2em] text-neon/80">
          {SIGNATURE_LABEL[operative.signature]}
        </span>
      </div>
    </motion.article>
  )
}


/**
 * MISSION HISTORY — derived entirely from the participation ids stored on the
 * operative and the mission records in src/data/missions.ts. No mission name
 * or status is written here, so a status change propagates automatically.
 */
function MissionHistory({ operative }: { operative: Operative }) {
  const history = missionHistory(operative)

  return (
    <section aria-label={missionHistoryCopy.heading} className="mt-5">
      <div className="flex items-center gap-2">
        <p className="font-tech text-[0.66rem] tracking-[0.22em] text-neon/70">{missionHistoryCopy.heading}</p>
        <span className="h-px flex-1 bg-line-soft" aria-hidden="true" />
        <span className="font-tech text-[0.6rem] tracking-[0.18em] text-mute/60">
          {missionHistoryCopy.countLabel(history.length)}
        </span>
      </div>
      <p className="font-tech mt-1.5 text-[0.6rem] leading-relaxed tracking-[0.16em] text-mute/55">
        {missionHistoryCopy.support}
      </p>

      {history.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {history.map((record) => (
            <MissionEntry key={record.id} record={record} operative={operative} />
          ))}
        </ul>
      ) : (
        <p className="font-tech mt-3 border border-line-soft px-2.5 py-2 text-[0.62rem] tracking-[0.18em] text-mute/60">
          {missionHistoryCopy.empty}
        </p>
      )}
    </section>
  )
}

function MissionEntry({ record, operative }: { record: OperativeMissionRecord; operative: Operative }) {
  const solo = record.solo && isSoloAssignment(operative, record.id)

  return (
    <li
      className={cn(
        'relative border px-2.5 py-2 transition-colors duration-300',
        solo ? 'border-neon/35 bg-neon/[0.045]' : 'border-line-soft bg-white/[0.012]',
        record.active && !solo && 'border-neon/20',
      )}
    >
      {/* left active rail */}
      <span
        className={cn(
          'absolute inset-y-0 left-0 w-px',
          record.active ? 'bg-neon/70' : 'bg-emerald/40',
        )}
        aria-hidden="true"
      />

      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="font-tech text-[0.6rem] tracking-[0.16em] text-mute/55">[{record.number}]</span>
        <span className="font-tech flex-1 text-[0.66rem] leading-snug tracking-[0.1em] text-bone/90">
          {record.title}
        </span>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <span
          className={cn(
            'font-tech inline-flex items-center gap-1.5 text-[0.58rem] tracking-[0.16em]',
            record.active ? 'text-neon' : 'text-emerald',
          )}
        >
          <span
            className={cn(
              'h-1 w-1 shrink-0 rounded-full',
              record.active ? 'bg-neon animate-pulse-dot' : 'bg-emerald',
            )}
            aria-hidden="true"
          />
          {record.statusLabel}
        </span>
        <span className="font-tech text-[0.58rem] tracking-[0.16em] text-mute/45" aria-hidden="true">
          //
        </span>
        <span className="font-tech text-[0.58rem] tracking-[0.16em] text-mute/60">
          {missionHistoryCopy.participation}
        </span>

        {solo && (
          <span className="font-tech ml-auto inline-flex items-center gap-1 border border-neon/45 px-1.5 py-0.5 text-[0.55rem] tracking-[0.16em] text-neon">
            <Lock size={7} aria-hidden="true" />
            {missionHistoryCopy.soloLabel}
          </span>
        )}
      </div>

      {solo && (
        <dl className="mt-2 space-y-1 border-t border-neon/20 pt-2">
          <SoloRow label={missionHistoryCopy.typeLabel} value={missionHistoryCopy.soloLabel} accent />
          <SoloRow label={missionHistoryCopy.assignedLabel} value={operative.codename} accent />
        </dl>
      )}
    </li>
  )
}

function SoloRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="font-tech text-[0.55rem] tracking-[0.16em] text-mute/55">{label}</dt>
      <dd className={cn('font-tech text-[0.58rem] tracking-[0.14em]', accent ? 'text-neon' : 'text-bone/80')}>
        {value}
      </dd>
    </div>
  )
}
