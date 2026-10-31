import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Cpu, ExternalLink, Search, Terminal, X } from 'lucide-react'

import { arsenalCopy, arsenalDisclaimer, arsenalGroups, arsenalTools, type ArsenalGroupId } from '../data/site'
import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'
import { playSound } from '../lib/audio'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'

/**
 * TECHNICAL ARSENAL 2.0
 * The existing tooling list, made searchable and filterable. Only
 * technologies already declared in this project's arsenal appear —
 * no invented expertise, levels or certifications. Cards carry no
 * description or link until one can be verified.
 */

type Filter = ArsenalGroupId | 'all'

export function Arsenal() {
  const reduce = useReducedMotion()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [openTool, setOpenTool] = useState<string | null>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return arsenalTools.filter((tool) => {
      const inGroup = filter === 'all' || tool.group === filter
      if (!inGroup) return false
      if (!q) return true
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.id.includes(q) ||
        tool.aliases.some((alias) => alias.includes(q))
      )
    })
  }, [filter, query])

  const counts = useMemo(() => {
    const map = new Map<ArsenalGroupId, number>()
    arsenalGroups.forEach((group) => {
      map.set(
        group.id,
        arsenalTools.filter((tool) => tool.group === group.id).length,
      )
    })
    return map
  }, [])

  return (
    <section
      id="arsenal"
      aria-labelledby="arsenal-heading"
      className="relative overflow-hidden border-t border-line-soft bg-abyss py-24 sm:py-32 lg:py-40"
    >
      <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden="true">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute right-1/4 top-0 h-[24rem] w-[min(40rem,90vw)] rounded-full bg-emerald/[0.05] blur-[130px]" />
      </div>

      <div className="container-x relative z-10">
        <SectionHeading
          index="05"
          id="arsenal-heading"
          label={arsenalCopy.label}
          lines={arsenalCopy.heading}
          aside={
            <span className="font-tech ml-auto hidden text-[0.7rem] tracking-[0.22em] text-mute/70 md:block">
              INDEX // {String(arsenalGroups.length).padStart(2, '0')} CATEGORIES
            </span>
          }
        >
          <Reveal delay={0.2}>
            <p className="text-[0.95rem] leading-relaxed text-mute">
              A working landscape of languages, systems and security fundamentals the collective builds with.
              Filter it, search it, expand a card — only declared tooling is listed.
            </p>
          </Reveal>
        </SectionHeading>

        {/* ── controls ── */}
        <div className="mt-10 flex flex-col gap-3 sm:mt-14 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="Filter arsenal by category"
          >
            <FilterChip
              active={filter === 'all'}
              onClick={() => {
                playSound('terminal')
                setFilter('all')
              }}
              label={arsenalCopy.all}
              count={arsenalTools.length}
            />
            {arsenalGroups.map((group) => (
              <FilterChip
                key={group.id}
                active={filter === group.id}
                onClick={() => {
                  playSound('terminal')
                  setFilter(group.id)
                }}
                label={group.label}
                count={counts.get(group.id) ?? 0}
              />
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <label htmlFor="arsenal-search" className="sr-only">
              {arsenalCopy.search}
            </label>
            <Search
              size={12}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-mute/50"
              aria-hidden="true"
            />
            <input
              id="arsenal-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={arsenalCopy.searchPlaceholder}
              className="font-tech w-full border border-line bg-void/60 py-2 pl-7 pr-8 text-[0.6rem] tracking-[0.16em] text-bone placeholder:text-mute/40 focus:border-neon/50 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-mute/50 transition-colors hover:text-neon"
              >
                <X size={11} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className="font-tech text-[0.52rem] tracking-[0.18em] text-mute/50" aria-live="polite">
            {arsenalCopy.results(results.length)}
          </span>
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
          <span className="font-tech flex items-center gap-1.5 text-[0.52rem] tracking-[0.18em] text-mute/40">
            <Terminal size={8} aria-hidden="true" />
            DECLARED TOOLING ONLY
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* ── terminal listing ── */}
          <Reveal className="lg:col-span-7" y={30}>
            <div className="relative overflow-hidden border border-line-soft bg-[#070b08]">
              <div className="flex items-center justify-between border-b border-line-soft px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-line" aria-hidden="true" />
                  <span className="h-2 w-2 rounded-full bg-line" aria-hidden="true" />
                  <span className="h-2 w-2 rounded-full bg-neon/60" aria-hidden="true" />
                  <span className="font-tech ml-2 text-[0.62rem] tracking-[0.18em] text-mute/70">
                    ghost@protocol: ~/arsenal
                  </span>
                </div>
                <Terminal size={11} className="text-neon/50" aria-hidden="true" />
              </div>

              <div className="p-4 sm:p-6">
                <p className="font-tech flex items-center gap-2 text-[0.66rem] tracking-[0.14em] text-bone/80">
                  <span className="text-neon" aria-hidden="true">
                    →
                  </span>
                  $ arsenal --list
                  <span className="inline-block h-3 w-[6px] bg-neon/80 animate-blink" aria-hidden="true" />
                </p>

                {results.length === 0 ? (
                  <div className="mt-6 border border-line-soft px-4 py-6 text-center">
                    <p className="font-tech text-[0.66rem] tracking-[0.18em] text-mute/70">{arsenalCopy.empty}</p>
                    <p className="mt-1.5 text-[0.78rem] text-mute/50">{arsenalCopy.emptyNote}</p>
                  </div>
                ) : (
                  <div className="mt-5 space-y-4">
                    {arsenalGroups.map((group) => {
                      const groupTools = results.filter((tool) => tool.group === group.id)
                      if (!groupTools.length) return null
                      return (
                        <motion.div
                          key={group.id}
                          layout={!reduce}
                          className="border-l border-line pl-3 transition-colors duration-500 hover:border-neon/60 sm:pl-4"
                        >
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <span className="font-tech text-[0.58rem] tracking-[0.16em] text-neon/60">
                              [{group.index}]
                            </span>
                            <span className="font-tech text-[0.62rem] tracking-[0.16em] text-neon">
                              {group.label}
                            </span>
                            <span className="font-tech ml-auto hidden text-[0.5rem] tracking-[0.14em] text-mute/50 sm:block">
                              {group.note}
                            </span>
                          </div>

                          <ul className="mt-2 flex flex-wrap gap-1.5">
                            {groupTools.map((tool) => {
                              const isOpen = openTool === tool.id
                              return (
                                <li key={tool.id}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      playSound('terminal')
                                      setOpenTool((current) => (current === tool.id ? null : tool.id))
                                    }}
                                    aria-expanded={isOpen}
                                    className={cn(
                                      'font-tech inline-flex items-center gap-1.5 border px-2 py-1 text-[0.6rem] tracking-[0.14em] transition-all duration-300',
                                      isOpen
                                        ? 'border-neon/60 bg-neon/10 text-neon'
                                        : 'border-line text-mute/80 hover:border-neon/35 hover:text-bone',
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        'h-[3px] w-[3px] transition-colors duration-300',
                                        isOpen ? 'bg-neon' : 'bg-mute/50',
                                      )}
                                      aria-hidden="true"
                                    />
                                    {tool.name}
                                  </button>
                                </li>
                              )
                            })}
                          </ul>

                          {groupTools.some((tool) => tool.id === openTool) && (
                            <div className="mt-2 border border-neon/20 bg-neon/[0.03] px-2.5 py-2">
                              {(() => {
                                const tool = groupTools.find((entry) => entry.id === openTool)!
                                return (
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <span className="font-tech text-[0.58rem] tracking-[0.16em] text-bone">
                                      {tool.name}
                                    </span>
                                    <span className="font-tech text-[0.5rem] tracking-[0.14em] text-mute/50">
                                      {tool.description ?? arsenalCopy.classified}
                                    </span>
                                    {tool.docs ? (
                                      <a
                                        href={tool.docs}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-tech ml-auto inline-flex items-center gap-1 text-[0.5rem] tracking-[0.14em] text-neon transition-colors hover:text-bone"
                                      >
                                        {arsenalCopy.docs}
                                        <ExternalLink size={8} aria-hidden="true" />
                                      </a>
                                    ) : (
                                      <span className="font-tech ml-auto text-[0.5rem] tracking-[0.14em] text-mute/35">
                                        NO VERIFIED LINK
                                      </span>
                                    )}
                                  </div>
                                )
                              })()}
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                )}

                <p className="font-tech mt-6 border-t border-line-soft pt-4 text-[0.6rem] leading-relaxed tracking-[0.14em] text-mute/70">
                  {arsenalDisclaimer}
                </p>
              </div>

              <div className="pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true">
                <div className="absolute inset-x-0 h-24 animate-scanline bg-gradient-to-b from-transparent via-neon to-transparent" />
              </div>
            </div>
          </Reveal>

          {/* ── capability matrix ── */}
          <div className="lg:col-span-5">
            <Reveal delay={0.1} y={30}>
              <div className="relative border border-line-soft bg-card/40 p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-tech text-[0.66rem] tracking-[0.22em] text-mute">CAPABILITY MATRIX</span>
                  <Cpu size={12} className="text-neon/60" aria-hidden="true" />
                </div>

                <div className="space-y-4">
                  {arsenalGroups.map((group) => {
                    const total = counts.get(group.id) ?? 0
                    const isActive = filter === group.id
                    const pct = Math.round((total / Math.max(...Array.from(counts.values()), 1)) * 100)
                    return (
                      <div key={group.id}>
                        <div className="mb-1.5 flex items-baseline justify-between gap-2">
                          <span
                            className={cn(
                              'font-tech text-[0.62rem] tracking-[0.16em] transition-colors duration-300',
                              isActive ? 'text-neon' : 'text-mute/80',
                            )}
                          >
                            {group.label}
                          </span>
                          <span className="font-tech text-[0.6rem] tracking-[0.16em] text-mute/70">
                            {String(total).padStart(2, '0')} TOOLS
                          </span>
                        </div>
                        <div className="h-[3px] w-full overflow-hidden bg-line">
                          <motion.div
                            className={cn(
                              'h-full origin-left transition-colors duration-500',
                              isActive ? 'bg-neon' : 'bg-emerald/50',
                            )}
                            initial={reduce ? false : { scaleX: 0 }}
                            whileInView={{ scaleX: pct / 100 }}
                            viewport={{ once: true, amount: 'some', margin: '160% 0px 15% 0px' }}
                            transition={{ duration: 1.2, ease: EASE_OUT_EXPO, delay: 0.1 }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-6 border-t border-line-soft pt-4">
                  <p className="font-tech text-[0.65rem] leading-relaxed tracking-[0.16em] text-mute/65">
                    BARS REFLECT CATEGORY WIDTH, NOT PROFICIENCY SCORES. EVERY OPERATIVE SPECIALISES DIFFERENTLY.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

function FilterChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'font-tech inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-[0.55rem] tracking-[0.14em] transition-colors duration-300',
        active
          ? 'border-neon/50 bg-neon/[0.08] text-neon'
          : 'border-line text-mute/70 hover:border-neon/30 hover:text-bone',
      )}
    >
      {label}
      <span className={cn('tabular-nums', active ? 'text-neon/70' : 'text-mute/40')}>{count}</span>
    </button>
  )
}
