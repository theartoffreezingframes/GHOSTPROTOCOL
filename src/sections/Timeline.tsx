import { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ChevronDown, History } from 'lucide-react'

import { timeline, timelineCopy } from '../data/intel'
import { archive, statusDisplay } from '../data/missions'
import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'
import { playSound } from '../lib/audio'
import { SectionHeading } from '../components/SectionHeading'
import { Reveal } from '../components/Reveal'

/**
 * PROTOCOL TIMELINE — milestones only. Every entry renders DATE
 * UNDISCLOSED because no verified date exists in the project, and
 * inventing one purely to fill the column would be a lie.
 */
export function Timeline() {
  const reduce = useReducedMotion()
  const trackRef = useRef<HTMLOListElement>(null)
  const [open, setOpen] = useState<string | null>(null)
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start 75%', 'end 60%'] })
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section
      id="timeline"
      aria-labelledby="timeline-heading"
      className="relative overflow-hidden border-t border-line-soft bg-abyss py-24 sm:py-32 lg:py-40"
    >
      <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden="true">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute left-1/2 top-1/2 h-[24rem] w-[min(40rem,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald/[0.035] blur-[130px]" />
      </div>

      <div className="container-x relative z-10">
        <SectionHeading
          id="timeline-heading"
          index="06.5"
          label={timelineCopy.label}
          lines={timelineCopy.heading}
          aside={
            <span className="font-tech ml-auto hidden items-center gap-2 text-[0.7rem] tracking-[0.22em] text-mute/70 md:flex">
              <History size={9} aria-hidden="true" />
              {String(timeline.length).padStart(2, '0')} MILESTONES
            </span>
          }
        >
          <Reveal delay={0.2}>
            <p className="text-[0.95rem] leading-relaxed text-mute">{timelineCopy.support}</p>
          </Reveal>
        </SectionHeading>

        <ol ref={trackRef} className="relative mt-12 space-y-0 pl-8 sm:mt-16 sm:pl-10">
          <div className="absolute bottom-2 left-[7px] top-2 w-px bg-line sm:left-[11px]" aria-hidden="true">
            <motion.div
              className="h-full w-full origin-top bg-gradient-to-b from-neon via-emerald to-neon/20"
              style={{ scaleY: reduce ? 1 : progress }}
            />
          </div>

          {timeline.map((entry, index) => {
            const mission = entry.missionId ? archive.find((m) => m.id === entry.missionId) : null
            const status = mission ? statusDisplay[mission.status] : null
            const isOpen = open === entry.id
            return (
              <motion.li
                key={entry.id}
                className="group relative pb-6 last:pb-0"
                initial={reduce ? false : { opacity: 0, x: 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 'some', margin: '160% 0px 15% 0px' }}
                transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: index * 0.06 }}
              >
                <span
                  className="absolute -left-8 top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-neon/40 bg-void transition-all duration-500 group-hover:border-neon group-hover:shadow-[0_0_16px_-2px_rgba(57,255,20,0.7)] sm:-left-10"
                  aria-hidden="true"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-neon/80 transition-transform duration-500 group-hover:scale-125" />
                </span>

                <div className="border-b border-line-soft pb-4 transition-colors duration-500 group-hover:border-neon/25">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-tech text-[0.5rem] tracking-[0.18em] text-neon/70">{entry.label}</span>
                    <span className="font-tech text-[0.5rem] tracking-[0.16em] text-mute/45">
                      {entry.date ?? timelineCopy.undated}
                    </span>
                    {status && (
                      <span
                        className={cn(
                          'font-tech ml-auto text-[0.5rem] tracking-[0.16em]',
                          status.active ? 'text-neon' : 'text-emerald',
                        )}
                      >
                        {status.label}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playSound('terminal')
                      setOpen((current) => (current === entry.id ? null : entry.id))
                    }}
                    aria-expanded={isOpen}
                    className="mt-1.5 flex w-full items-center justify-between gap-3 text-left"
                  >
                    <span className="font-display text-[1.1rem] font-medium uppercase leading-tight tracking-[-0.01em] text-bone transition-colors group-hover:text-neon sm:text-[1.3rem]">
                      {entry.title}
                    </span>
                    <ChevronDown
                      size={13}
                      className={cn('shrink-0 text-mute/50 transition-transform duration-400', isOpen && 'rotate-180 text-neon')}
                      aria-hidden="true"
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && entry.detail && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: reduce ? 0 : 0.45, ease: EASE_OUT_EXPO }}
                        className="overflow-hidden"
                      >
                        <p className="mt-2 max-w-lg text-[0.82rem] leading-relaxed text-mute">{entry.detail}</p>
                        <p className="font-tech mt-2 text-[0.5rem] tracking-[0.16em] text-mute/40">
                          {mission
                            ? `FILE ${mission.number} // ${mission.codename}`
                            : 'PROTOCOL RECORD // NO MISSION FILE'}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
