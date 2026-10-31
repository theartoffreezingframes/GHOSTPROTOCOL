import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, CornerDownLeft, Search, X } from 'lucide-react'

import { activeOperatives } from '../data/team'
import { archive, statusDisplay, type Mission } from '../data/missions'
import { nav } from '../data/site'
import { focusMission } from '../lib/deepLink'
import { FOCUS_MISSIONS_EVENT, emit } from '../lib/events'
import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'
import { playSound } from '../lib/audio'
import { useDossier } from './DossierProvider'

/**
 * GHOST COMMAND PALETTE
 * ---------------------------------------------------------------
 * One search surface over the existing data model: the same six
 * operative records, the same four operations and the same nav array
 * everything else reads. Nothing is duplicated here.
 *
 * Activation is deliberately narrow — Ctrl/Cmd + K only, and never
 * while focus is inside a field, a contenteditable region or an open
 * dialog. No other shortcut is intercepted.
 */

type ResultKind = 'operative' | 'mission' | 'section'

type Result = {
  id: string
  kind: ResultKind
  /** Primary display label. */
  title: string
  /** Secondary line. */
  subtitle: string
  /** Everything searchable for this entry, lowercased. */
  haystack: string
  keywords: string[]
  run: () => void
}

const KIND_LABEL: Record<ResultKind, string> = {
  operative: 'OPERATIVE',
  mission: 'OPERATION',
  section: 'SECTION',
}

const KIND_ORDER: ResultKind[] = ['operative', 'mission', 'section']

/** Section copy for the palette — titles come from the shared nav array. */
/** Sections that are not primary nav entries get their own copy too. */
const SECTION_BLURB: Record<string, string> = {
  status: 'Content-model counters',
  protocol: 'The unit brief',
  operatives: 'Six classified dossiers',
  network: 'Participation map',
  missions: 'Classified operations',
  transmissions: 'Encrypted intercepts',
  lab: 'Engineering bays',
  arsenal: 'Declared tooling',
  radar: 'Fictional sweep',
  timeline: 'Milestone log',
  record: 'Verified entries',
  intel: 'Redacted files',
  contact: 'Connection request',
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable ||
    target.closest('[role="dialog"]') !== null ||
    target.closest('[data-palette-ignore]') !== null
  )
}

export function CommandPalette({
  onNavigate,
  onOpenMissions,
}: {
  onNavigate: (id: string) => void
  onOpenMissions: () => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const reduce = useReducedMotion()
  const { open: openDossier } = useDossier()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const restoreTo = useRef<HTMLElement | null>(null)
  const listId = useId()

  /** Every result, built from the shared model on each open. */
  const results = useMemo<Result[]>(() => {
    const close = () => setOpen(false)

    const operativeResults: Result[] = activeOperatives.map((operative) => ({
      id: `op-${operative.number}`,
      kind: 'operative',
      title: operative.codename,
      subtitle: `${operative.fullName} · ${operative.role}`,
      haystack: [
        operative.codename,
        operative.fullName,
        operative.designation,
        operative.role,
        operative.number,
        `gp-${operative.number}`,
        ...operative.traits,
      ]
        .join(' ')
        .toLowerCase(),
      keywords: ['operative', 'dossier', 'personnel', 'open'],
      run: () => {
        close()
        openDossier(operative.codename)
      },
    }))

    const missionResults: Result[] = archive.map((mission: Mission) => ({
      id: `ms-${mission.id}`,
      kind: 'mission',
      title: mission.title,
      subtitle: `${statusDisplay[mission.status].label} · ${
        mission.operationType === 'SOLO' ? 'SOLO OPERATION' : 'TEAM OPERATION'
      }`,
      haystack: [
        mission.title,
        mission.codename,
        mission.number,
        mission.status,
        mission.operationType,
        mission.event ?? '',
        'mission operation archive',
      ]
        .join(' ')
        .toLowerCase(),
      keywords: ['mission', 'operation', 'archive', 'open', 'search'],
      run: () => {
        close()
        // Scope the archive to this operation, then land on its row.
        emit(FOCUS_MISSIONS_EVENT, { missionId: mission.id })
        onOpenMissions()
        window.setTimeout(() => focusMission(mission.id, Boolean(reduce)), reduce ? 0 : 120)
      },
    }))

    const sectionResults: Result[] = nav.map((item) => ({
      id: `sec-${item.id}`,
      kind: 'section',
      title: item.label.toUpperCase(),
      subtitle: SECTION_BLURB[item.id] ?? 'Classified section',
      haystack: [item.label, item.short, item.id, SECTION_BLURB[item.id] ?? '', 'section show go']
        .join(' ')
        .toLowerCase(),
      keywords: ['section', 'show', 'go', 'open'],
      run: () => {
        close()
        onNavigate(item.id)
      },
    }))

    return [...operativeResults, ...missionResults, ...sectionResults]
  }, [onNavigate, onOpenMissions, openDossier, reduce])

  /** Natural-language glue so "open ghost" and "show radar" both land. */
  const ranked = useMemo(() => {
    const terms = query
      .toLowerCase()
      .replace(/[^a-z0-9\s.+-]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
    // Verbs are commands, not search terms.
    const meaningful = terms.filter(
      (term) => !['open', 'show', 'go', 'to', 'the', 'search', 'find', 'view'].includes(term),
    )

    const scored = results
      .map((result) => {
        if (meaningful.length === 0) {
          return { result, score: 0 }
        }
        let score = 0
        for (const term of meaningful) {
          const inTitle = result.title.toLowerCase().includes(term)
          const inSub = result.subtitle.toLowerCase().includes(term)
          const inHay = result.haystack.includes(term)
          const inKeys = result.keywords.some((keyword) => keyword.includes(term))
          if (inTitle) score += 6
          if (inSub) score += 3
          if (inHay) score += 2
          if (inKeys) score += 1
          if (!inTitle && !inSub && !inHay && !inKeys) return { result, score: -1 }
        }
        // Prefer a title that starts with the first meaningful term.
        if (result.title.toLowerCase().startsWith(meaningful[0])) score += 4
        return { result, score }
      })
      .filter((entry) => entry.score >= 0)
      .sort((a, b) => b.score - a.score)

    const order = new Map(KIND_ORDER.map((kind, index) => [kind, index]))
    return scored
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return (order.get(a.result.kind) ?? 9) - (order.get(b.result.kind) ?? 9)
      })
      .map((entry) => entry.result)
  }, [query, results])

  const grouped = useMemo(() => {
    const map = new Map<ResultKind, Result[]>()
    for (const result of ranked) {
      const list = map.get(result.kind) ?? []
      list.push(result)
      map.set(result.kind, list)
    }
    return KIND_ORDER.filter((kind) => map.has(kind)).map((kind) => ({
      kind,
      items: map.get(kind) ?? [],
    }))
  }, [ranked])

  /* ── open / close ───────────────────────────────────────────────── */

  const show = useCallback(() => {
    playSound('terminal')
    restoreTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setQuery('')
    setCursor(0)
    setOpen(true)
  }, [])

  const hide = useCallback(() => {
    setOpen(false)
    // Return focus to wherever the visitor was before the palette.
    const target = restoreTo.current
    if (target?.isConnected) {
      window.setTimeout(() => target.focus({ preventScroll: true }), 0)
    }
  }, [])

  // Global shortcut — Ctrl+K / Cmd+K, and nothing else.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const k = event.key.toLowerCase()
      if (k !== 'k') return
      if (!(event.metaKey || event.ctrlKey)) return
      // Never fight a native browser action or a field being typed in.
      if (event.altKey || event.shiftKey) return
      if (isTypingTarget(event.target)) return
      event.preventDefault()
      setOpen((current) => {
        if (current) {
          const target = restoreTo.current
          if (target?.isConnected) window.setTimeout(() => target.focus({ preventScroll: true }), 0)
          return false
        }
        restoreTo.current =
          document.activeElement instanceof HTMLElement ? document.activeElement : null
        setQuery('')
        setCursor(0)
        playSound('terminal')
        return true
      })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Focus the field on open; lock the page behind the palette.
  useEffect(() => {
    if (!open) {
      document.body.classList.remove('is-locked')
      return
    }
    document.body.classList.add('is-locked')
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => {
      window.cancelAnimationFrame(frame)
      document.body.classList.remove('is-locked')
    }
  }, [open])

  /* ── keyboard navigation inside the palette ─────────────────────── */

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      hide()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setCursor((current) => (ranked.length === 0 ? 0 : (current + 1) % ranked.length))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setCursor((current) => (ranked.length === 0 ? 0 : (current - 1 + ranked.length) % ranked.length))
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      const target = ranked[cursor]
      if (target) {
        playSound('confirm')
        target.run()
      }
    }
  }

  // Keep the active row visible when navigating by keyboard.
  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>('[data-active="true"]')
    node?.scrollIntoView({ block: 'nearest' })
  }, [cursor, query])

  // Reset the cursor when the result set changes under the visitor.
  useEffect(() => {
    setCursor((current) => (current >= ranked.length ? 0 : current))
  }, [ranked.length])

  /* ── highlight helper ───────────────────────────────────────────── */

  const terms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s.+-]/g, ' ')
    .split(/\s+/)
    .filter((term) => term.length > 1 && !['open', 'show', 'search', 'find', 'view'].includes(term))

  const highlight = (text: string) => {
    if (terms.length === 0) return text
    const escaped = terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
    return parts.map((part, index) =>
      terms.includes(part.toLowerCase()) ? (
        <mark key={index} className="bg-transparent text-neon">
          {part}
        </mark>
      ) : (
        <span key={index}>{part}</span>
      ),
    )
  }

  let flatIndex = -1

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[250] flex items-start justify-center px-4 pt-[10vh] sm:pt-[14vh]"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            data-command-palette
          >
            {/* backdrop */}
            <div
              className="absolute inset-0 bg-void/80 backdrop-blur-[6px]"
              onClick={hide}
              aria-hidden="true"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="command-palette-title"
              className="relative w-full max-w-2xl overflow-hidden border border-neon/25 bg-[#060907]/96 shadow-[0_30px_120px_-30px_rgba(57,255,20,0.28)]"
              initial={reduce ? false : { opacity: 0, y: -14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.99 }}
              transition={{ duration: reduce ? 0 : 0.26, ease: EASE_OUT_EXPO }}
              onKeyDown={onKeyDown}
            >
              {/* header */}
              <div className="flex items-center justify-between border-b border-line-soft px-4 py-2">
                <h2
                  id="command-palette-title"
                  className="font-tech flex items-center gap-2 text-[0.58rem] tracking-[0.28em] text-neon"
                >
                  <span className="h-1 w-1 animate-pulse-dot rounded-full bg-neon" aria-hidden="true" />
                  GHOST COMMAND // QUERY INTERFACE
                </h2>
                <div className="flex items-center gap-2">
                  <kbd className="font-tech border border-line-soft px-1.5 py-0.5 text-[0.5rem] tracking-[0.14em] text-mute/60">
                    ESC
                  </kbd>
                  <button
                    type="button"
                    onClick={hide}
                    aria-label="Close command palette"
                    className="text-mute/60 transition-colors hover:text-neon focus-visible:text-neon"
                  >
                    <X size={13} aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* search */}
              <div className="flex items-center gap-3 border-b border-line-soft px-4 py-3 focus-within:bg-neon/[0.03]">
                <Search size={15} className="shrink-0 text-neon/70" aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="text"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls={listId}
                  aria-autocomplete="list"
                  aria-activedescendant={ranked[cursor] ? `${listId}-${ranked[cursor].id}` : undefined}
                  aria-label="Search operatives, operations and sections"
                  autoComplete="off"
                  spellCheck={false}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setCursor(0)
                  }}
                  placeholder="SEARCH OPERATIVES, OPERATIONS, SECTIONS…"
                  data-focus-ring="container"
                  className="font-tech w-full bg-transparent text-[0.8rem] tracking-[0.08em] text-bone outline-none placeholder:text-mute/40"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('')
                      inputRef.current?.focus()
                    }}
                    className="font-tech shrink-0 text-[0.5rem] tracking-[0.16em] text-mute/60 transition-colors hover:text-neon"
                  >
                    CLEAR
                  </button>
                )}
              </div>

              {/* results */}
              <ul
                ref={listRef}
                id={listId}
                role="listbox"
                aria-label="Command results"
                className="max-h-[min(56vh,26rem)] overflow-y-auto overscroll-contain py-1"
              >
                {ranked.length === 0 && (
                  <li className="px-4 py-10 text-center">
                    <p className="font-tech text-[0.62rem] tracking-[0.2em] text-mute/70">
                      NO MATCHING RECORDS
                    </p>
                    <p className="mt-2 text-[0.66rem] leading-relaxed text-mute/45">
                      Try an operative codename (GHOST), an operation (BLACKOUT) or a
                      section (RADAR).
                    </p>
                  </li>
                )}

                {grouped.map((group) => (
                  <li key={group.kind}>
                    <p className="font-tech px-4 pb-1 pt-3 text-[0.5rem] tracking-[0.3em] text-mute/40">
                      {KIND_LABEL[group.kind]}S
                    </p>
                    <ul role="group" aria-label={KIND_LABEL[group.kind]}>
                      {group.items.map((result) => {
                        flatIndex += 1
                        const index = flatIndex
                        const active = index === cursor
                        return (
                          <li key={result.id} role="none">
                            <button
                              type="button"
                              id={`${listId}-${result.id}`}
                              role="option"
                              aria-selected={active}
                              data-active={active}
                              onMouseMove={() => setCursor(index)}
                              onClick={() => {
                                playSound('confirm')
                                result.run()
                              }}
                              className={cn(
                                'group flex w-full items-center gap-3 px-4 py-2 text-left transition-colors',
                                active ? 'bg-neon/[0.09]' : 'hover:bg-white/[0.03]',
                              )}
                            >
                              <span
                                className={cn(
                                  'font-tech w-[3.4rem] shrink-0 text-[0.46rem] tracking-[0.16em]',
                                  active ? 'text-neon' : 'text-mute/40',
                                )}
                              >
                                {KIND_LABEL[result.kind]}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span
                                  className={cn(
                                    'font-tech block truncate text-[0.74rem] tracking-[0.1em]',
                                    active ? 'text-bone' : 'text-bone/80',
                                  )}
                                >
                                  {highlight(result.title)}
                                </span>
                                <span className="mt-0.5 block truncate text-[0.6rem] tracking-[0.04em] text-mute/55">
                                  {highlight(result.subtitle)}
                                </span>
                              </span>
                              <ArrowUpRight
                                size={12}
                                aria-hidden="true"
                                className={cn(
                                  'shrink-0 transition-opacity',
                                  active ? 'text-neon opacity-100' : 'text-mute/40 opacity-0',
                                )}
                              />
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </li>
                ))}
              </ul>

              {/* footer hints */}
              <div className="font-tech flex flex-wrap items-center justify-between gap-2 border-t border-line-soft px-4 py-2 text-[0.48rem] tracking-[0.16em] text-mute/45">
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="border border-line-soft px-1 py-0.5">↑</kbd>
                    <kbd className="border border-line-soft px-1 py-0.5">↓</kbd>
                    NAVIGATE
                  </span>
                  <span className="flex items-center gap-1">
                    <CornerDownLeft size={9} aria-hidden="true" />
                    SELECT
                  </span>
                </span>
                <span>{ranked.length} RECORD{ranked.length === 1 ? '' : 'S'} · FICTIONAL INDEX</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* the visible, clickable trigger in the header */}
      <button
        type="button"
        onClick={show}
        aria-label="Open command palette"
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K"
        data-palette-ignore
        className="group flex items-center gap-1.5 border border-line-soft px-2 py-2 font-tech text-[0.6rem] tracking-[0.14em] text-mute/70 transition-colors hover:border-neon/50 hover:text-neon focus-visible:text-neon sm:gap-2 sm:px-2.5"
      >
        <Search size={11} aria-hidden="true" />
        <span className="hidden lg:inline">SEARCH</span>
        <kbd className="hidden items-center gap-0.5 text-[0.5rem] tracking-[0.1em] text-mute/45 xl:flex">
          <span className="border border-line-soft px-1">⌘</span>
          <span className="border border-line-soft px-1">K</span>
        </kbd>
      </button>
    </>
  )
}
