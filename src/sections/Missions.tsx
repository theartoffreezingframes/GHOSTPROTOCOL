import { useId, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Archive, Check, ChevronDown, FileLock2, MapPin, Radio, ScanLine } from 'lucide-react'

import { archiveRows, featureMission, missionMeta, statusCounts, statusDisplay, type Mission } from '../data/missions'
import { imageFallback, imageSrcSet } from '../lib/media'
import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { StatusPill } from '../components/StatusPill'
import { BlackoutMission } from './Blackout'

export function Missions() {
  const completed = archiveRows.filter((m) => m.status === 'COMPLETED')
  const live = archiveRows.filter((m) => m.status === 'ONGOING')
  const upcoming = archiveRows.filter((m) => m.status === 'UPCOMING')
  const archivedTotal = String(statusCounts.completed).padStart(2, '0')
  const liveTotal = String(statusCounts.active).padStart(2, '0')

  return (
    <section
      id="missions"
      aria-labelledby="missions-heading"
      className="relative overflow-hidden border-t border-line-soft bg-abyss py-24 sm:py-32 lg:py-40"
    >
      <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden="true">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute right-0 top-1/3 h-[34rem] w-[min(34rem,86vw)] rounded-full bg-emerald/[0.05] blur-[140px]" />
      </div>

      <div className="container-x relative z-10">
        <SectionHeading
          id="missions-heading"
          index="03"
          label={missionMeta.label}
          lines={missionMeta.heading}
          aside={
            <span className="font-tech ml-auto hidden items-center gap-2 text-[0.7rem] tracking-[0.22em] text-mute/70 md:flex">
              <Archive size={9} aria-hidden="true" />
              ARCHIVE // {archivedTotal} COMPLETE · {liveTotal} LIVE
            </span>
          }
        >
          <Reveal delay={0.2}>
            <p className="text-[0.95rem] leading-relaxed text-mute">{missionMeta.note}</p>
          </Reveal>
        </SectionHeading>

        {/* archived missions — alternating editorial rows */}
        {completed.length > 0 && (
          <div className="mt-14 space-y-6 sm:mt-20 sm:space-y-8">
            {completed.map((mission, index) => (
              <MissionRecord key={mission.number} mission={mission} index={index} />
            ))}
          </div>
        )}

        {/* live operations — the centrepiece carries the classified treatment */}
        {(live.length > 0 || upcoming.length > 0) && (
          <div className="mt-16 sm:mt-24">
            <div className="mb-5 flex items-center gap-3">
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full rounded-full bg-neon animate-pulse-dot" />
              </span>
              <span className="font-tech text-[0.7rem] tracking-[0.26em] text-neon">{missionMeta.liveLabel}</span>
              <span className="h-px flex-1 bg-gradient-to-r from-neon/40 to-transparent" aria-hidden="true" />
            </div>
            <BlackoutMission mission={featureMission} />
          </div>
        )}

        {/* additional live operations — briefing-styled archive rows */}
        {live.filter((mission) => mission !== featureMission).length > 0 && (
          <div className="mt-8 space-y-6 sm:mt-10 sm:space-y-8">
            {live
              .filter((mission) => mission !== featureMission)
              .map((mission, index) => (
                <MissionRecord key={mission.number} mission={mission} index={index} live />
              ))}
          </div>
        )}
      </div>
    </section>
  )
}

function MissionRecord({ mission, index, live = false }: { mission: Mission; index: number; live?: boolean }) {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const id = useId()
  const reversed = index % 2 === 1
  const status = statusDisplay[mission.status]
  const summaryFallback = status.active
    ? 'Operation is live. Debrief fields stay sealed until the unit clears them for release.'
    : 'Field record declassified as complete. Detailed debrief fields are open for the operative unit to publish.'

  return (
    <motion.article
      className={cn(
        'group relative overflow-hidden border bg-card/40 transition-colors duration-500',
        live ? 'border-neon/25 hover:border-neon/45' : 'border-line-soft hover:border-neon/25',
      )}
      initial={reduce ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 'some', margin: '160% 0px 15% 0px' }}
      transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: index * 0.08 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* imagery */}
        <div
          className={cn(
            'relative min-h-[15rem] overflow-hidden bg-void lg:col-span-7 lg:min-h-[26rem]',
            reversed && 'lg:order-2',
          )}
        >
          {mission.image && (
            <img
              src={imageFallback(mission.image)}
              srcSet={imageSrcSet(mission.image)}
              sizes="(min-width: 1024px) 58vw, 100vw"
              alt={mission.image.alt}
              loading="lazy"
              decoding="async"
              width={1400}
              height={933}
              className="absolute inset-0 h-full w-full scale-[1.03] object-cover opacity-80 brightness-[1.06] grayscale-[35%] transition-all duration-[1400ms] ease-out group-hover:scale-[1.08] group-hover:opacity-95 group-hover:grayscale-0"
            />
          )}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-card via-void/30 to-void/10 lg:via-void/10 lg:to-card',
              reversed ? 'lg:bg-gradient-to-l' : 'lg:bg-gradient-to-r',
              reversed ? 'lg:from-card' : 'lg:from-transparent',
            )}
          />
          <div
            className="absolute inset-0 opacity-[0.45] mix-blend-overlay"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 1px, transparent 1px, transparent 3px)',
            }}
            aria-hidden="true"
          />

          {/* archive / live stamp */}
          <div
            className={cn(
              'absolute left-4 top-4 z-20 flex items-center gap-2 border bg-void/70 px-2.5 py-1 backdrop-blur-sm sm:left-5 sm:top-5',
              status.active ? 'border-neon/45' : 'border-emerald/30',
            )}
          >
            {status.active ? (
              <Radio size={9} className="text-neon" aria-hidden="true" />
            ) : (
              <Check size={9} className="text-emerald" aria-hidden="true" />
            )}
            <span
              className={cn('font-tech text-[0.66rem] tracking-[0.2em]', status.active ? 'text-neon' : 'text-emerald')}
            >
              {status.active ? 'LIVE OPERATION' : 'ARCHIVED'}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 sm:bottom-5 sm:left-5">
            <span className="font-tech text-[2.4rem] font-light leading-none tracking-[-0.04em] text-bone/40 sm:text-[3.2rem]">
              {mission.number}
            </span>
            <span className="font-tech pb-1 text-[0.66rem] tracking-[0.22em] text-mute/75">MISSION FILE</span>
          </div>
        </div>

        {/* record body */}
        <div
          className={cn(
            'relative flex flex-col justify-between p-5 sm:p-7 lg:col-span-5 lg:p-8',
            reversed && 'lg:order-1',
          )}
        >
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <StatusPill tone={status.tone} pulse={status.active}>
                {status.label}
              </StatusPill>
              {mission.tags.map((tag) => (
                <StatusPill key={tag} tone="muted">
                  {tag}
                </StatusPill>
              ))}
            </div>

            <h3 className="font-display text-[clamp(1.5rem,3.4vw,2.15rem)] font-medium uppercase leading-[0.98] tracking-[-0.035em] text-bone">
              {mission.title}
            </h3>

            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-line-soft py-4">
              {status.active ? (
                <>
                  <Meta label="MISSION STATUS" value={status.label} live />
                  <Meta label="OPERATION" value={mission.codename} />
                  <Meta label="ACCESS" value="CLASSIFIED" live />
                  <Meta label="DATE" value={mission.date ?? 'AWAITING INTEL'} muted />
                </>
              ) : (
                <>
                  <Meta label="EVENT" value={mission.event ?? 'AWAITING INTEL'} />
                  <Meta label="MISSION STATUS" value={status.label} accent />
                  <Meta label="DATE" value={mission.date ?? 'AWAITING INTEL'} muted />
                  <Meta label="VENUE" value={mission.venue ?? 'AWAITING INTEL'} muted />
                </>
              )}
            </dl>

            <p className="mt-4 text-[0.85rem] leading-relaxed text-mute">{mission.summary ?? summaryFallback}</p>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              {...(open ? { 'aria-controls': `${id}-panel` } : {})}
              className="font-tech flex w-full items-center justify-between border-t border-line-soft pt-4 text-[0.7rem] tracking-[0.2em] text-bone/80 transition-colors hover:text-neon"
            >
              {open ? 'COLLAPSE MISSION RECORD' : 'OPEN MISSION RECORD'}
              <ChevronDown
                size={13}
                className={cn('transition-transform duration-500', open && 'rotate-180')}
                aria-hidden="true"
              />
            </button>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  id={`${id}-panel`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
                  className="overflow-hidden"
                >
                  <ul className="pt-4">
                    {mission.dossier.map((field, i) => (
                      <motion.li
                        key={field.label}
                        className="flex items-start gap-3 border-b border-line-soft/70 py-2.5 last:border-0"
                        initial={reduce ? { opacity: 0 } : { opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.45, delay: 0.04 * i, ease: EASE_OUT_EXPO }}
                      >
                        <span className="font-tech mt-[3px] w-5 shrink-0 text-[0.7rem] tracking-[0.16em] text-neon/50">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0">
                          <p className="font-tech text-[0.66rem] tracking-[0.18em] text-mute/80">{field.label}</p>
                          <p
                            className={cn(
                              'mt-1 text-[0.8rem] leading-snug',
                              field.value ? 'text-bone/90' : 'font-tech text-[0.66rem] tracking-[0.18em] text-mute/65',
                            )}
                          >
                            {field.value ?? '[ ENCRYPTED · AWAITING SUPPLY ]'}
                          </p>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* footer metadata strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-soft bg-void/40 px-5 py-2.5 sm:px-7">
        <span className="font-tech flex items-center gap-2 text-[0.66rem] tracking-[0.2em] text-mute/75">
          <ScanLine size={9} aria-hidden="true" />
          FILE {mission.number} // {mission.codename}
        </span>
        <span className="font-tech flex items-center gap-2 text-[0.66rem] tracking-[0.2em] text-mute/75">
          <FileLock2 size={9} aria-hidden="true" />
          {status.active ? 'BRIEFING SEALED' : 'CLEARANCE GRANTED'}
        </span>
        <span className="font-tech hidden items-center gap-2 text-[0.66rem] tracking-[0.2em] text-mute/75 sm:flex">
          <MapPin size={9} aria-hidden="true" />
          SECTOR UNLISTED
        </span>
      </div>
    </motion.article>
  )
}

function Meta({
  label,
  value,
  accent,
  muted,
  live,
}: {
  label: string
  value: string
  accent?: boolean
  muted?: boolean
  live?: boolean
}) {
  return (
    <div>
      <dt className="font-tech text-[0.7rem] tracking-[0.2em] text-mute/75">{label}</dt>
      <dd
        className={cn(
          'font-tech mt-1 flex items-center gap-1.5 truncate text-[0.7rem] tracking-[0.14em]',
          accent && 'text-emerald',
          live && 'text-neon',
          muted && 'text-mute/70',
          !accent && !muted && !live && 'text-bone/85',
        )}
      >
        {live && (
          <span className="relative flex h-1 w-1 shrink-0" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full rounded-full bg-neon animate-pulse-dot" />
          </span>
        )}
        {value}
      </dd>
    </div>
  )
}
