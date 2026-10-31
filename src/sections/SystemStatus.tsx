import { motion, useReducedMotion } from 'motion/react'
import { Activity, Database, FolderLock, Radio, Users } from 'lucide-react'

import { systemCopy } from '../data/intel'
import { stats, two } from '../lib/model'
import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'

/**
 * SYSTEM STATUS PANEL
 * Every number is derived in src/lib/model.ts from the operatives and
 * missions arrays. "ONLINE" is a presentation label — this build has
 * no backend and monitors nothing, which the footnote states.
 */
export function SystemStatus() {
  const reduce = useReducedMotion()

  const cards = [
    {
      key: 'link',
      label: 'GHOST PROTOCOL',
      value: systemCopy.online,
      meta: 'STATIC BUILD',
      icon: Activity,
      tone: 'neon' as const,
    },
    {
      key: 'personnel',
      label: systemCopy.labels.operatives,
      value: two(stats.operatives),
      meta: 'ON FILE',
      icon: Users,
      tone: 'bone' as const,
    },
    {
      key: 'active',
      label: systemCopy.labels.active,
      value: two(stats.activeOperations),
      meta: 'IN MOTION',
      icon: Radio,
      tone: 'neon' as const,
    },
    {
      key: 'archived',
      label: systemCopy.labels.archived,
      value: two(stats.archivedOperations),
      meta: 'SEALED',
      icon: FolderLock,
      tone: 'emerald' as const,
    },
  ]

  return (
    <section
      id="status"
      aria-labelledby="status-heading"
      className="relative overflow-hidden border-t border-line-soft bg-void py-16 sm:py-20"
    >
      <div className="container-x relative z-10">
        <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="font-tech text-[0.62rem] tracking-[0.26em] text-neon">07.2</span>
          <span className="font-tech text-[0.62rem] tracking-[0.26em] text-mute" aria-hidden="true">
            //
          </span>
          <h2
            id="status-heading"
            className="font-tech text-[0.62rem] tracking-[0.26em] text-mute"
          >
            {systemCopy.heading}
          </h2>
          <span className="hidden h-px flex-1 bg-line sm:block" aria-hidden="true" />
          <span className="font-tech hidden items-center gap-2 text-[0.6rem] tracking-[0.2em] text-mute/60 sm:flex">
            <Database size={9} aria-hidden="true" />
            CONTENT MODEL // LIVE
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {cards.map((card, index) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.key}
                className="group relative overflow-hidden border border-line-soft bg-card/40 px-3 py-4 transition-colors duration-500 hover:border-neon/30 sm:px-4"
                initial={reduce ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 'some', margin: '160% 0px 15% 0px' }}
                transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: index * 0.06 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-tech text-[0.5rem] leading-tight tracking-[0.16em] text-mute/55 sm:text-[0.55rem]">
                    {card.label}
                  </span>
                  <Icon
                    size={11}
                    className={cn(
                      'shrink-0',
                      card.tone === 'neon' ? 'text-neon/70' : card.tone === 'emerald' ? 'text-emerald/70' : 'text-mute/50',
                    )}
                    aria-hidden="true"
                  />
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span
                    className={cn(
                      'font-display text-[1.5rem] font-medium leading-none tracking-tight sm:text-[1.9rem]',
                      card.tone === 'neon' ? 'text-neon' : card.tone === 'emerald' ? 'text-emerald' : 'text-bone',
                    )}
                  >
                    {card.value}
                  </span>
                  <span className="font-tech text-[0.45rem] tracking-[0.14em] text-mute/45 sm:text-[0.5rem]">
                    {card.meta}
                  </span>
                </div>

                <span
                  className={cn(
                    'absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100',
                    card.tone === 'emerald' ? 'bg-emerald/60' : 'bg-neon/60',
                  )}
                  aria-hidden="true"
                />
              </motion.div>
            )
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="font-tech flex items-center gap-1.5 text-[0.5rem] tracking-[0.16em] text-mute/50">
            <span className="h-1 w-1 rounded-full bg-neon animate-pulse-dot" aria-hidden="true" />
            {systemCopy.labels.missions} // {two(stats.missions)}
          </span>
          <span className="font-tech text-[0.5rem] tracking-[0.16em] text-mute/50">
            {systemCopy.labels.assignments} // {two(stats.assignments)}
          </span>
          <span className="font-tech text-[0.5rem] tracking-[0.16em] text-mute/50">
            SOLO OPERATIONS // {two(stats.soloOperations)}
          </span>
        </div>

        <p className="font-tech mt-3 max-w-2xl border-l border-line px-3 text-[0.5rem] leading-relaxed tracking-[0.13em] text-mute/40">
          {systemCopy.notice}
        </p>
      </div>
    </section>
  )
}
