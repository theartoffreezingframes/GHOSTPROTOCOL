import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { Award, BadgeCheck, CircleDot, Flag, ShieldQuestion } from 'lucide-react'

import { records, recordEmptyNote } from '../data/site'
import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { StatusPill } from '../components/StatusPill'

const TYPE_ICON = {
  HACKATHON: Flag,
  CTF: CircleDot,
  AWARD: Award,
  CERTIFICATION: BadgeCheck,
  MILESTONE: CircleDot,
  RECOGNITION: Award,
} as const

export function Record() {
  const reduce = useReducedMotion()
  const trackRef = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start 70%', 'end 65%'],
  })
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1])
  const visible = records.filter((entry) => entry.verified)

  return (
    <section
      id="record"
      aria-labelledby="record-heading"
      className="relative overflow-hidden border-t border-line-soft bg-void py-24 sm:py-32 lg:py-40"
    >
      <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden="true">
        <div className="absolute inset-0 grid-bg opacity-25" />
        <div className="absolute left-1/2 top-1/2 h-[26rem] w-[min(36rem,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald/[0.04] blur-[130px]" />
      </div>

      <div className="container-x relative z-10">
        <SectionHeading
          index="06"
          label="RECORD OF OPERATIONS"
          lines={['EVERY MISSION', 'LEAVES A MARK.']}
          aside={
            <span className="font-tech ml-auto hidden text-[0.6rem] tracking-[0.22em] text-mute/70 md:block">
              VERIFIED ENTRIES ONLY
            </span>
          }
        >
          <Reveal delay={0.2}>
            <p className="text-[0.95rem] leading-relaxed text-mute">
              Participation, challenges and milestones — logged only once they can be verified.
            </p>
          </Reveal>
        </SectionHeading>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:mt-20 lg:grid-cols-12">
          {/* timeline */}
          <div className="lg:col-span-8">
            <ol ref={trackRef} className="relative space-y-0 pl-8 sm:pl-10">
              {/* rail */}
              <div className="absolute bottom-2 left-[7px] top-2 w-px bg-line sm:left-[11px]" aria-hidden="true">
                <motion.div
                  className="h-full w-full origin-top bg-gradient-to-b from-neon via-emerald to-neon/20"
                  style={{ scaleY: reduce ? 1 : progress }}
                />
              </div>

              {visible.map((entry, index) => {
                const Icon = TYPE_ICON[entry.type]
                return (
                  <motion.li
                    key={entry.id}
                    className="group relative pb-8 last:pb-0"
                    initial={{ opacity: 0, x: reduce ? 0 : 22 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.85, ease: EASE_OUT_EXPO, delay: index * 0.08 }}
                  >
                    {/* node */}
                    <span
                      className="absolute -left-8 top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-neon/40 bg-void transition-all duration-500 group-hover:border-neon group-hover:shadow-[0_0_16px_-2px_rgba(57,255,20,0.7)] sm:-left-10"
                      aria-hidden="true"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-neon/80 transition-transform duration-500 group-hover:scale-125" />
                    </span>

                    <div className="flex flex-col gap-2 border-b border-line-soft pb-6 transition-colors duration-500 group-hover:border-neon/25">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill tone="online">
                          <span className="flex items-center gap-1.5">
                            <Icon size={8} aria-hidden="true" />
                            {entry.type}
                          </span>
                        </StatusPill>
                        <span className="font-tech text-[0.62rem] tracking-[0.2em] text-mute/50">
                          {entry.year ?? 'UNDATED'}
                        </span>
                        <span className="font-tech ml-auto text-[0.62rem] tracking-[0.18em] text-emerald/80">
                          VERIFIED
                        </span>
                      </div>
                      <h3 className="font-display text-[1.25rem] font-semibold uppercase leading-tight tracking-[-0.02em] text-bone transition-colors duration-500 group-hover:text-neon sm:text-[1.5rem]">
                        {entry.title}
                      </h3>
                      {entry.detail && (
                        <p className="max-w-lg text-[0.84rem] leading-relaxed text-mute">{entry.detail}</p>
                      )}
                    </div>
                  </motion.li>
                )
              })}
            </ol>
          </div>

          {/* integrity note */}
          <div className="lg:col-span-4">
            <Reveal delay={0.15}>
              <div className="relative border border-line-soft bg-card/40 p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-tech text-[0.58rem] tracking-[0.22em] text-mute">RECORD INTEGRITY</span>
                  <ShieldQuestion size={13} className="text-neon/60" aria-hidden="true" />
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'HACKATHONS', count: records.filter((r) => r.type === 'HACKATHON').length },
                    { label: 'CTF EVENTS', count: records.filter((r) => r.type === 'CTF').length },
                    { label: 'AWARDS', count: records.filter((r) => r.type === 'AWARD').length },
                    { label: 'CERTIFICATIONS', count: records.filter((r) => r.type === 'CERTIFICATION').length },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-3">
                      <span className="font-tech text-[0.58rem] tracking-[0.18em] text-mute/80">{row.label}</span>
                      <div className="flex flex-1 items-center gap-2 pl-3">
                        <span className="h-px flex-1 bg-line" aria-hidden="true" />
                        <span
                          className={cn(
                            'font-tech text-[0.62rem] tabular-nums',
                            row.count > 0 ? 'text-neon' : 'text-mute/40',
                          )}
                        >
                          {row.count > 0 ? String(row.count).padStart(2, '0') : '—'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-5 border-t border-line-soft pt-4 text-[0.78rem] leading-relaxed text-mute">
                  {recordEmptyNote}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
