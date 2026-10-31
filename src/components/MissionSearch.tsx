import { useCallback, useEffect, useId, useMemo, useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Search, SlidersHorizontal, X } from 'lucide-react'

import { archive, statusDisplay } from '../data/missions'
import { activeOperatives } from '../data/team'
import { operativesForMission } from '../lib/model'
import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'
import { playSound } from '../lib/audio'

/**
 * ADVANCED MISSION SEARCH
 * ---------------------------------------------------------------
 * Filters the existing four operations by text, status, operative and
 * operation type. Every predicate runs against the same arrays the
 * archive renders (`archive`, `activeOperatives`) and the same derived
 * relationship (`operativesForMission`), so BLACKOUT can only ever
 * report GHOST — there is no second copy of participation to drift.
 *
 * This component owns *filter state only*. The archive continues to
 * render the mission cards, unchanged.
 */

export type MissionFilters = {
  query: string
  status: 'ALL' | 'COMPLETED' | 'ONGOING'
  operative: string
  type: 'ALL' | 'SOLO' | 'TEAM'
}

export const EMPTY_FILTERS: MissionFilters = {
  query: '',
  status: 'ALL',
  operative: 'ALL',
  type: 'ALL',
}

const STATUS_OPTIONS: MissionFilters['status'][] = ['ALL', 'COMPLETED', 'ONGOING']
const TYPE_OPTIONS: { value: MissionFilters['type']; label: string }[] = [
  { value: 'ALL', label: 'ALL' },
  { value: 'SOLO', label: 'SOLO OPERATION' },
  { value: 'TEAM', label: 'TEAM OPERATION' },
]

export function filterMissions(filters: MissionFilters) {
  const terms = filters.query
    .toLowerCase()
    .replace(/[^a-z0-9\s.+-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  return archive.filter((mission) => {
    if (filters.status !== 'ALL' && mission.status !== filters.status) return false
    if (filters.type !== 'ALL' && mission.operationType !== filters.type) return false

    const participants = operativesForMission(mission.id)
    if (filters.operative !== 'ALL') {
      if (!participants.some((operative) => operative.codename === filters.operative)) return false
    }

    if (terms.length === 0) return true

    // Searchable: mission name, codename, number, status, operation type
    // and every participating operative's codename.
    const haystack = [
      mission.title,
      mission.codename,
      mission.number,
      mission.status,
      statusDisplay[mission.status].label,
      mission.operationType,
      mission.operationType === 'SOLO' ? 'solo operation' : 'team operation',
      mission.event ?? '',
      ...participants.map((operative) => operative.codename),
    ]
      .join(' ')
      .toLowerCase()

    return terms.every((term) => haystack.includes(term))
  })
}

export function MissionSearch({
  filters,
  onChange,
  matched,
}: {
  filters: MissionFilters
  onChange: (next: MissionFilters) => void
  matched: number
}) {
  const reduce = useReducedMotion()
  const searchId = useId()
  const debounce = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(debounce.current), [])

  const set = useCallback(
    <K extends keyof MissionFilters>(key: K, value: MissionFilters[K]) => {
      onChange({ ...filters, [key]: value })
    },
    [filters, onChange],
  )

  const active =
    filters.query.trim() !== '' ||
    filters.status !== 'ALL' ||
    filters.operative !== 'ALL' ||
    filters.type !== 'ALL'

  const statusCounts = useMemo(() => {
    return {
      ALL: archive.length,
      COMPLETED: archive.filter((mission) => mission.status === 'COMPLETED').length,
      ONGOING: archive.filter((mission) => mission.status === 'ONGOING').length,
    }
  }, [])

  return (
    <motion.div
      className="mt-10 border border-line-soft bg-card/30 sm:mt-14"
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 'some', margin: '160% 0px 15% 0px' }}
      transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
      data-mission-search
    >
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-soft px-3 py-2">
        <span className="font-tech flex items-center gap-2 text-[0.52rem] tracking-[0.22em] text-neon/85">
          <SlidersHorizontal size={10} aria-hidden="true" />
          MISSION QUERY INTERFACE
        </span>
        <span className="font-tech text-[0.48rem] tracking-[0.18em] text-mute/50">
          <span aria-live="polite" className="text-neon/80">
            {String(matched).padStart(2, '0')}
          </span>{' '}
          / {String(archive.length).padStart(2, '0')} MATCHING
        </span>
      </div>

      {/* search */}
      <div className="border-b border-line-soft px-3 py-2.5">
        <div className="flex items-center gap-2 border border-line-soft px-2.5 py-1.5 focus-within:border-neon/40">
          <Search size={12} className="shrink-0 text-neon/70" aria-hidden="true" />
          <label htmlFor={searchId} className="sr-only">
            Search missions by name, operative, status or type
          </label>
          <input
            id={searchId}
            type="search"
            value={filters.query}
            onChange={(event) => {
              const value = event.target.value
              window.clearTimeout(debounce.current)
              debounce.current = window.setTimeout(() => set('query', value), 0)
              onChange({ ...filters, query: value })
            }}
            placeholder="SEARCH NAME, OPERATIVE, STATUS OR TYPE…"
            autoComplete="off"
            className="font-tech w-full bg-transparent text-[0.64rem] tracking-[0.1em] text-bone outline-none placeholder:text-mute/35"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => set('query', '')}
              aria-label="Clear mission search"
              className="text-mute/50 transition-colors hover:text-neon"
            >
              <X size={11} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* filter rows */}
      <div className="divide-y divide-line-soft/60">
        <FilterRow label="STATUS">
          {STATUS_OPTIONS.map((option) => (
            <Chip
              key={option}
              active={filters.status === option}
              onClick={() => set('status', option)}
              label={option === 'ALL' ? 'ALL' : option}
              count={statusCounts[option]}
            />
          ))}
        </FilterRow>

        <FilterRow label="OPERATIVE">
          <Chip
            active={filters.operative === 'ALL'}
            onClick={() => set('operative', 'ALL')}
            label="ALL"
          />
          {activeOperatives.map((operative) => (
            <Chip
              key={operative.number}
              active={filters.operative === operative.codename}
              onClick={() => set('operative', operative.codename)}
              label={operative.codename}
            />
          ))}
        </FilterRow>

        <FilterRow label="TYPE">
          {TYPE_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              active={filters.type === option.value}
              onClick={() => set('type', option.value)}
              label={option.label}
            />
          ))}
        </FilterRow>
      </div>

      {/* footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line-soft px-3 py-2">
        <p className="font-tech text-[0.46rem] leading-relaxed tracking-[0.14em] text-mute/40">
          FILTERS COMBINE · DERIVED FROM THE SHARED MISSION RECORDS
        </p>
        {active && (
          <button
            type="button"
            onClick={() => {
              playSound('terminal')
              onChange(EMPTY_FILTERS)
            }}
            className="font-tech border border-line-soft px-2 py-1 text-[0.48rem] tracking-[0.16em] text-mute/70 transition-colors hover:border-neon/40 hover:text-neon"
          >
            CLEAR ALL FILTERS
          </button>
        )}
      </div>
    </motion.div>
  )
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 px-3 py-2 sm:flex-row sm:items-center sm:gap-3">
      <span className="font-tech w-[5.2rem] shrink-0 text-[0.46rem] tracking-[0.22em] text-mute/45">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function Chip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'font-tech inline-flex items-center gap-1.5 border px-2 py-1 text-[0.48rem] tracking-[0.16em] transition-colors',
        active
          ? 'border-neon/60 bg-neon/10 text-neon'
          : 'border-line-soft text-mute/60 hover:border-neon/30 hover:text-bone',
      )}
    >
      {label}
      {typeof count === 'number' && (
        <span className={cn('text-[0.42rem]', active ? 'text-neon/70' : 'text-mute/40')}>{count}</span>
      )}
    </button>
  )
}
