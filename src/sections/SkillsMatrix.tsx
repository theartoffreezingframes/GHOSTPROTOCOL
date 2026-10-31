import { useId, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CheckCircle2, CircleDashed, Clock3, Info, MinusCircle, Search, Shapes, X } from 'lucide-react'

import { type Operative } from '../data/team'
import {
  matrixOperatives,
  skillCell,
  skillCategories,
  skillMatrixCopy,
  verifiedToolCount,
  type SkillCategory,
  type SkillState,
} from '../lib/skills'
import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'
import { SectionHeading } from '../components/SectionHeading'
import { Reveal } from '../components/Reveal'
import { playSound } from '../lib/audio'

/**
 * OPERATIVE CAPABILITY MATRIX
 * ---------------------------------------------------------------
 * Ten comparison rows against the six operative columns. Every cell is
 * derived from the documented tooling in `src/data/site.ts`, so a tool
 * that is not recorded for an operative can never appear as verified.
 *
 * There are no scores, percentages, levels or rankings anywhere in this
 * component — by design. A cell either cites the tools on file, or it
 * states that the record is silent.
 */

const STATE_ICON: Record<SkillState, typeof CheckCircle2> = {
  VERIFIED: CheckCircle2,
  'PENDING VERIFICATION': Clock3,
  'UNIT TOOLKIT': Shapes,
  'NOT SPECIFIED': CircleDashed,
  'INFORMATION UNAVAILABLE': MinusCircle,
}

const STATE_TONE: Record<SkillState, string> = {
  VERIFIED: 'text-neon',
  'PENDING VERIFICATION': 'text-mute/55',
  'UNIT TOOLKIT': 'text-neon/55',
  'NOT SPECIFIED': 'text-mute/45',
  'INFORMATION UNAVAILABLE': 'text-mute/30',
}

export function SkillsMatrix() {
  const reduce = useReducedMotion()
  const [query, setQuery] = useState('')
  const [compare, setCompare] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<SkillCategory | null>(null)
  const [hover, setHover] = useState<{ codename: string; category: string; detail: string } | null>(null)
  const searchId = useId()
  const detailId = useId()

  const terms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s/+.-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  /** Filtering narrows BOTH axes; it never hides evidence silently. */
  const visibleOperatives = useMemo(() => {
    if (terms.length === 0) return matrixOperatives
    return matrixOperatives.filter((operative) => {
      const haystack = [operative.codename, operative.role, operative.designation, operative.fullName]
        .join(' ')
        .toLowerCase()
      const matchesSelf = terms.every((term) => haystack.includes(term))
      const matchesTool = terms.every((term) =>
        skillCategories.some((category) =>
          skillCell(operative.codename, category).tools.some((tool) =>
            `${tool.name} ${tool.aliases.join(' ')}`.toLowerCase().includes(term),
          ),
        ),
      )
      return matchesSelf || matchesTool
    })
  }, [terms])

  const visibleCategories = useMemo(() => {
    if (terms.length === 0) return skillCategories
    const byLabel = skillCategories.filter((category) => {
      const haystack = `${category.label} ${category.note}`.toLowerCase()
      return terms.every((term) => haystack.includes(term))
    })
    if (byLabel.length > 0) return byLabel
    // A tool term should surface the rows that contain that tool.
    const byTool = skillCategories.filter((category) =>
      matrixOperatives.some((operative) =>
        skillCell(operative.codename, category).tools.some((tool) =>
          `${tool.name} ${tool.aliases.join(' ')}`.toLowerCase().includes(terms.join(' ')),
        ),
      ),
    )
    return byTool
  }, [terms])

  const compareActive = compare.length > 0
  const isDimmed = (codename: string) => compareActive && !compare.includes(codename)

  const toggleCompare = (codename: string) => {
    playSound('terminal')
    setCompare((current) =>
      current.includes(codename)
        ? current.filter((entry) => entry !== codename)
        : [...current, codename],
    )
  }

  const clearAll = () => {
    setQuery('')
    setCompare([])
    setActiveCategory(null)
  }

  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="relative overflow-hidden border-t border-line-soft bg-abyss py-24 sm:py-32 lg:py-40"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute right-0 top-1/4 h-[30rem] w-[min(32rem,88vw)] rounded-full bg-emerald/[0.045] blur-[140px]" />
      </div>

      <div className="container-x relative z-10">
        <SectionHeading
          id="skills-heading"
          index="04.5"
          label={skillMatrixCopy.label}
          lines={skillMatrixCopy.heading}
          aside={
            <span className="font-tech ml-auto hidden items-center gap-2 text-[0.7rem] tracking-[0.22em] text-mute/70 md:flex">
              <Info size={9} aria-hidden="true" />
              06 OPERATIVES // 11 ROWS
            </span>
          }
        >
          <Reveal delay={0.2}>
            <p className="max-w-2xl text-[0.95rem] leading-relaxed text-mute">
              {skillMatrixCopy.note}
            </p>
          </Reveal>
        </SectionHeading>

        {/* ── why every individual cell is a gap ── */}
        <div className="mt-8 flex flex-col gap-2 border-l border-neon/40 bg-neon/[0.035] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-tech max-w-2xl text-[0.56rem] leading-relaxed tracking-[0.1em] text-bone/70">
            <span className="text-neon">INDIVIDUAL SKILLS: PENDING VERIFICATION.</span>{' '}
            {skillMatrixCopy.pendingBanner.replace('INDIVIDUAL SKILLS ARE PENDING VERIFICATION. ', '')}
          </p>
          <p className="font-tech shrink-0 text-[0.46rem] tracking-[0.16em] text-mute/45">
            STATUS // <span className="text-mute/70">AWAITING INDIVIDUAL CONFIRMATION</span>
          </p>
        </div>

        {/* ── controls ── */}
        <div className="mt-10 flex flex-col gap-3 sm:mt-14 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full items-center gap-2 border border-line-soft bg-card/40 px-3 py-2 focus-within:border-neon/40 lg:max-w-sm">
            <Search size={12} className="shrink-0 text-neon/70" aria-hidden="true" />
            <label htmlFor={searchId} className="sr-only">
              {skillMatrixCopy.searchLabel}
            </label>
            <input
              id={searchId}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={skillMatrixCopy.searchPlaceholder}
              autoComplete="off"
              className="font-tech w-full bg-transparent text-[0.66rem] tracking-[0.12em] text-bone outline-none placeholder:text-mute/35"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear capability search"
                className="text-mute/50 transition-colors hover:text-neon"
              >
                <X size={11} aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-tech text-[0.5rem] tracking-[0.2em] text-mute/50">
              {skillMatrixCopy.compare}:
            </span>
            {matrixOperatives.map((operative) => {
              const on = compare.includes(operative.codename)
              return (
                <button
                  key={operative.number}
                  type="button"
                  onClick={() => toggleCompare(operative.codename)}
                  aria-pressed={on}
                  className={cn(
                    'font-tech border px-2 py-1 text-[0.5rem] tracking-[0.16em] transition-colors',
                    on
                      ? 'border-neon/60 bg-neon/10 text-neon'
                      : 'border-line-soft text-mute/60 hover:border-neon/35 hover:text-bone',
                  )}
                >
                  {operative.codename}
                </button>
              )
            })}
            {(query || compareActive || activeCategory) && (
              <button
                type="button"
                onClick={clearAll}
                className="font-tech ml-1 border border-line-soft px-2 py-1 text-[0.5rem] tracking-[0.16em] text-mute/60 transition-colors hover:border-neon/40 hover:text-neon"
              >
                {skillMatrixCopy.clear}
              </button>
            )}
          </div>
        </div>

        {/* ── empty state ── */}
        {visibleOperatives.length === 0 && (
          <p className="font-tech mt-10 border border-dashed border-line-soft px-4 py-10 text-center text-[0.62rem] tracking-[0.18em] text-mute/60">
            {skillMatrixCopy.empty}
          </p>
        )}

        {/* ── matrix ── */}
        {visibleOperatives.length > 0 && (
          <div className="mt-6 overflow-x-auto border border-line-soft bg-card/20">
            <table className="gp-matrix-table w-full min-w-[46rem]">
              <caption className="sr-only">
                Documented capability matrix: eleven skill rows against the six operatives. Cells cite
                the tools on file, or state that the record is silent. No scores or rankings.
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="sticky left-0 z-20 bg-abyss/95 p-3 text-left backdrop-blur-sm">
                    <span className="font-tech text-[0.52rem] tracking-[0.22em] text-mute/50">
                      CATEGORY
                    </span>
                  </th>
                  {visibleOperatives.map((operative) => {
                    const on = compare.includes(operative.codename)
                    return (
                      <th
                        key={operative.number}
                        scope="col"
                        className={cn(
                          'min-w-[7.5rem] border-l border-line-soft p-2 align-bottom transition-opacity',
                          isDimmed(operative.codename) && 'opacity-35',
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => toggleCompare(operative.codename)}
                          aria-pressed={on}
                          aria-label={`Select ${operative.codename} for comparison`}
                          className={cn(
                            'group w-full border px-2 py-2 text-left transition-colors',
                            on
                              ? 'border-neon/60 bg-neon/[0.08]'
                              : 'border-transparent hover:border-line-soft',
                          )}
                        >
                          <span className="font-tech block text-[0.44rem] tracking-[0.2em] text-neon/60">
                            GP-{operative.number}
                          </span>
                          <span
                            className={cn(
                              'font-display mt-1 block text-[0.95rem] uppercase leading-none',
                              on ? 'text-neon' : 'text-bone',
                            )}
                          >
                            {operative.codename}
                          </span>
                          <span className="font-tech mt-1 block truncate text-[0.44rem] tracking-[0.14em] text-mute/55">
                            {operative.role}
                          </span>
                        </button>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {visibleCategories.map((category) => {
                  const isActive = activeCategory?.id === category.id
                  return (
                    <tr
                      key={category.id}
                      className={cn('transition-colors', isActive && 'bg-neon/[0.04]')}
                    >
                      <th
                        scope="row"
                        className="sticky left-0 z-10 bg-abyss/95 p-0 text-left backdrop-blur-sm"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            playSound('scan')
                            setActiveCategory((current) =>
                              current?.id === category.id ? null : category,
                            )
                          }}
                          aria-expanded={isActive}
                          {...(isActive ? { 'aria-controls': detailId } : {})}
                          className="group flex w-full items-start gap-2 px-3 py-3 transition-colors hover:bg-white/[0.02]"
                        >
                          <span
                            className={cn(
                              'mt-0.5 h-1 w-1 shrink-0 rounded-full transition-colors',
                              isActive ? 'bg-neon' : 'bg-mute/30',
                            )}
                            aria-hidden="true"
                          />
                          <span className="min-w-0">
                            <span
                              className={cn(
                                'font-tech block text-[0.56rem] leading-tight tracking-[0.14em] transition-colors',
                                isActive ? 'text-neon' : 'text-bone/85 group-hover:text-neon/90',
                              )}
                            >
                              {category.label}
                            </span>
                            <span className="font-tech mt-1 block text-[0.42rem] tracking-[0.14em] text-mute/40">
                              {category.toolBased ? category.note : 'NOT TOOL-BASED'}
                            </span>
                          </span>
                        </button>
                      </th>

                      {visibleOperatives.map((operative) => {
                        const cell = skillCell(operative.codename, category)
                        const Icon = STATE_ICON[cell.state]
                        const dim = isDimmed(operative.codename)
                        return (
                          <td
                            key={operative.number}
                            className={cn(
                              'border-l border-line-soft p-0 text-center transition-opacity',
                              dim && 'opacity-35',
                            )}
                          >
                            <button
                              type="button"
                              onMouseEnter={() =>
                                setHover({
                                  codename: operative.codename,
                                  category: category.label,
                                  detail: cell.detail,
                                })
                              }
                              onMouseLeave={() => setHover(null)}
                              onFocus={() =>
                                setHover({
                                  codename: operative.codename,
                                  category: category.label,
                                  detail: cell.detail,
                                })
                              }
                              onBlur={() => setHover(null)}
                              onClick={() => {
                                playSound('scan')
                                setActiveCategory(category)
                              }}
                              aria-label={`${operative.codename} — ${category.label}: ${
                                skillMatrixCopy.states[cell.state]
                              }. ${cell.detail}`}
                              className="flex h-full w-full flex-col items-center justify-center gap-1 px-2 py-3 transition-colors hover:bg-white/[0.03]"
                            >
                              <Icon size={13} className={STATE_TONE[cell.state]} aria-hidden="true" />
                              <span
                                className={cn(
                                  'font-tech text-[0.5rem] tracking-[0.12em]',
                                  cell.state === 'VERIFIED'
                                    ? 'text-neon'
                                    : cell.state === 'UNIT TOOLKIT'
                                      ? 'text-neon/50'
                                      : cell.state === 'PENDING VERIFICATION'
                                        ? 'text-mute/55'
                                        : 'text-mute/45',
                                )}
                              >
                                {cell.state === 'VERIFIED'
                                  ? `${cell.label} TOOL${cell.tools.length === 1 ? '' : 'S'}`
                                  : skillMatrixCopy.states[cell.state]}
                              </span>
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* hover / focus readout — one line, always in the same place */}
        <div
          className="mt-3 min-h-[2.25rem] border border-line-soft bg-card/30 px-3 py-2"
          role="status"
          aria-live="polite"
        >
          <p
            className={cn(
              'font-tech text-[0.52rem] leading-relaxed tracking-[0.1em] transition-colors',
              hover ? 'text-bone/75' : 'text-mute/40',
            )}
          >
            {hover
              ? `${hover.codename} · ${hover.category} — ${hover.detail}`
              : 'Hover or focus a cell for its exact basis. Select a category to open its record.'}
          </p>
        </div>

        {/* ── category detail ── */}
        <AnimatePresence initial={false}>
          {activeCategory && (
            <motion.div
              id={detailId}
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: reduce ? 0 : 0.4, ease: EASE_OUT_EXPO }}
              className="overflow-hidden"
            >
              <div className="mt-4 border border-line-soft bg-card/30 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line-soft pb-3">
                  <div>
                    <p className="font-tech text-[0.46rem] tracking-[0.26em] text-neon/70">
                      {skillMatrixCopy.detailTitle}
                    </p>
                    <h3 className="font-display mt-1 text-[1.15rem] uppercase text-bone">
                      {activeCategory.label}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveCategory(null)}
                    className="font-tech border border-line-soft px-2 py-1 text-[0.5rem] tracking-[0.16em] text-mute/60 transition-colors hover:border-neon/40 hover:text-neon"
                  >
                    CLOSE
                  </button>
                </div>

                {!activeCategory.toolBased ? (
                  <p className="mt-3 text-[0.72rem] leading-relaxed text-mute/70">
                    This axis is not tracked by tooling, so the site holds no records for it.
                    Nothing is inferred from codenames, roles or designations — the honest state is
                    <span className="text-bone/80"> INFORMATION UNAVAILABLE</span> for all six
                    operatives.
                  </p>
                ) : (
                  <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {visibleOperatives.map((operative) => {
                      const cell = skillCell(operative.codename, activeCategory)
                      return (
                        <li
                          key={operative.number}
                          className={cn(
                            'border border-line-soft/70 p-2.5 transition-opacity',
                            isDimmed(operative.codename) && 'opacity-40',
                          )}
                        >
                          <p className="font-tech flex items-center justify-between gap-2 text-[0.52rem] tracking-[0.16em]">
                            <span className="text-bone/85">{operative.codename}</span>
                            <span
                              className={cn(
                                'text-[0.44rem]',
                                cell.state === 'VERIFIED' ? 'text-neon/80' : 'text-mute/40',
                              )}
                            >
                              {skillMatrixCopy.states[cell.state]}
                            </span>
                          </p>
                          <p className="mt-1.5 text-[0.66rem] leading-snug text-mute/65">
                            {cell.state === 'VERIFIED'
                              ? cell.tools.map((tool) => tool.name).join(' · ')
                              : cell.state === 'UNIT TOOLKIT'
                                ? `${skillMatrixCopy.unitNote} ${cell.tools
                                    .map((tool) => tool.name)
                                    .join(' · ')}`
                                : activeCategory.basis}
                          </p>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── legend ── */}
        <div className="mt-8 grid grid-cols-1 gap-3 border-t border-line-soft pt-5 sm:grid-cols-2 lg:grid-cols-5">
          {(
            [
              'VERIFIED',
              'PENDING VERIFICATION',
              'UNIT TOOLKIT',
              'NOT SPECIFIED',
              'INFORMATION UNAVAILABLE',
            ] as SkillState[]
          ).map((state) => {
            const Icon = STATE_ICON[state]
            return (
              <div key={state} className="flex items-start gap-2">
                <Icon size={12} className={cn('mt-0.5 shrink-0', STATE_TONE[state])} aria-hidden="true" />
                <div>
                  <p className={cn('font-tech text-[0.5rem] tracking-[0.18em]', STATE_TONE[state])}>
                    {skillMatrixCopy.states[state]}
                  </p>
                  <p className="mt-1 text-[0.62rem] leading-snug text-mute/55">
                    {skillMatrixCopy.stateNotes[state]}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-5 max-w-3xl text-[0.66rem] leading-relaxed text-mute/45">
          {skillMatrixCopy.footnote}
        </p>

        {/* verified tool totals — a count of records, not a score */}
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
          {matrixOperatives.map((operative: Operative) => (
            <li key={operative.number} className="font-tech text-[0.46rem] tracking-[0.16em] text-mute/40">
              {operative.codename}
              <span className="ml-1.5 text-neon/55">
                {String(verifiedToolCount(operative.codename)).padStart(2, '0')} PERSONAL
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
