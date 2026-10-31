import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Network, RotateCcw, X } from 'lucide-react'

import { activeOperatives } from '../data/team'
import { archive, statusDisplay, type MissionId } from '../data/missions'
import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'
import { playSound } from '../lib/audio'
import { SectionHeading } from '../components/SectionHeading'
import { Reveal } from '../components/Reveal'
import { useDossier } from '../components/DossierProvider'

/**
 * OPERATIVE NETWORK MAP
 * ---------------------------------------------------------------
 * Both node rings and every connection are derived from the same
 * participation ids the dossiers use, so the map cannot disagree with
 * the archive. Nothing about the graph is hardcoded here.
 *
 * Portrait nodes sit on a 3:2 coordinate box; the x axis is pulled
 * toward the centre on small screens so the graph narrows instead of
 * overflowing.
 */

const VIEW_W = 900
const VIEW_H = 600
const NARROW = 0.74

type Selection = { type: 'operative'; id: string } | { type: 'mission'; id: MissionId }

export function NetworkMap() {
  const reduce = useReducedMotion()
  const [selection, setSelection] = useState<Selection | null>(null)
  const [hover, setHover] = useState<Selection | null>(null)
  const [narrow, setNarrow] = useState(false)
  const { open: openDossier } = useDossier()

  // The graph narrows below 640px; measured rather than guessed so SSR and
  // hydration always agree.
  useEffect(() => {
    const query = window.matchMedia('(max-width: 639px)')
    const sync = () => setNarrow(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  const project = useCallback(
    (xPct: number, yPct: number) => {
      const p = narrow ? NARROW : 1
      const x = VIEW_W / 2 + ((xPct - 50) / 50) * (VIEW_W / 2) * p
      const y = (yPct / 100) * VIEW_H
      return { x, y }
    },
    [narrow],
  )

  const operativePoints = useMemo(
    () =>
      activeOperatives.map((operative) => ({
        operative,
        ...project(operative.node.x, operative.node.y),
      })),
    [project],
  )

  const missionPoints = useMemo(() => {
    // Missions are laid out on a baseline under the operative ring. Only
    // missions that actually have participants are drawn.
    const withMembers = archive.filter((mission) =>
      activeOperatives.some((operative) => operative.missions.includes(mission.id)),
    )
    const span = 70
    const start = 50 - span / 2
    return withMembers.map((mission, index) => {
      const xPct = withMembers.length === 1 ? 50 : start + (span / Math.max(1, withMembers.length - 1)) * index
      const x = project(xPct, 0).x
      // Mission chips sit on a baseline inside the box — placing them at
      // 100% put their centres exactly on the viewBox edge, where half the
      // chip was clipped and the click target fell outside the SVG.
      return { mission, x, y: VIEW_H - 34 }
    })
  }, [project])

  const edges = useMemo(
    () =>
      missionPoints.flatMap(({ mission, x, y }) =>
        operativePoints
          .filter(({ operative }) => operative.missions.includes(mission.id))
          .map(({ operative, x: ox, y: oy }) => ({
            key: `${mission.id}-${operative.number}`,
            missionId: mission.id,
            codename: operative.codename,
            x1: ox,
            y1: oy,
            x2: x,
            y2: y,
            active: statusDisplay[mission.status].active,
          })),
      ),
    [missionPoints, operativePoints],
  )

  const selectedOperative =
    selection?.type === 'operative'
      ? activeOperatives.find((operative) => operative.codename === selection.id)
      : null
  const selectedMission =
    selection?.type === 'mission' ? archive.find((mission) => mission.id === selection.id) : null

  const isEdgeLit = (edge: { missionId: MissionId; codename: string }) => {
    const active = selection ?? hover
    if (!active) return null
    if (active.type === 'operative') return edge.codename === active.id
    return edge.missionId === active.id
  }

  const operativeLit = (codename: string) => {
    const active = selection ?? hover
    if (!active) return true
    if (active.type === 'operative') return active.id === codename
    const mission = archive.find((m) => m.id === active.id)
    const member = activeOperatives.find((o) => o.codename === codename)
    return Boolean(mission && member?.missions.includes(mission.id))
  }

  const missionLit = (id: MissionId) => {
    const active = selection ?? hover
    if (!active) return true
    if (active.type === 'mission') return active.id === id
    const operative = activeOperatives.find((o) => o.codename === active.id)
    return Boolean(operative?.missions.includes(id))
  }

  const reset = useCallback(() => {
    setSelection(null)
    setHover(null)
  }, [])

  const handleOperativeClick = (codename: string) => {
    playSound('confirm')
    if (selection?.type === 'operative' && selection.id === codename) {
      // Second click on an already-selected node opens the dossier.
      openDossier(codename)
      return
    }
    setSelection({ type: 'operative', id: codename })
  }

  const handleMissionClick = (id: MissionId) => {
    playSound('confirm')
    setSelection((current) => (current?.type === 'mission' && current.id === id ? null : { type: 'mission', id }))
  }

  const hoverLabel = (() => {
    const active = hover ?? selection
    if (!active) return null
    if (active.type === 'operative') {
      const operative = activeOperatives.find((o) => o.codename === active.id)
      if (!operative) return null
      return {
        title: operative.codename,
        meta: `${operative.designation} // ${operative.role}`,
        detail: `${operative.missions.length} confirmed operation${operative.missions.length === 1 ? '' : 's'}`,
      }
    }
    const mission = archive.find((m) => m.id === active.id)
    if (!mission) return null
    const members = activeOperatives.filter((o) => o.missions.includes(mission.id))
    return {
      title: mission.title,
      meta: `${statusDisplay[mission.status].label}${mission.operationType === 'SOLO' ? ' // SOLO OPERATION' : ''}`,
      detail:
        members.length === 0
          ? 'NO OPERATIVE ASSIGNED'
          : `${String(members.length).padStart(2, '0')} ASSIGNED // ${members.map((m) => m.codename).join(' · ')}`,
    }
  })()

  return (
    <section
      id="network"
      aria-labelledby="network-heading"
      className="relative overflow-hidden border-t border-line-soft bg-abyss py-24 sm:py-32 lg:py-40"
    >
      <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden="true">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute left-1/2 top-1/3 h-[30rem] w-[min(46rem,92vw)] -translate-x-1/2 rounded-full bg-emerald/[0.05] blur-[130px]" />
      </div>

      <div className="container-x relative z-10">
        <SectionHeading
          id="network-heading"
          index="02.5"
          label="OPERATIVE NETWORK"
          lines={['WHO OPERATES', 'ON WHAT.']}
          aside={
            <span className="font-tech ml-auto hidden items-center gap-2 text-[0.7rem] tracking-[0.22em] text-mute/70 md:flex">
              <Network size={9} aria-hidden="true" />
              {String(edges.length).padStart(2, '0')} LINKS // {activeOperatives.length} NODES
            </span>
          }
        >
          <Reveal delay={0.2}>
            <p className="text-[0.95rem] leading-relaxed text-mute">
              Every connection below is drawn from the same participation records as the dossiers. Select a
              node to trace it — nothing here is entered twice.
            </p>
          </Reveal>
        </SectionHeading>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:mt-16 lg:grid-cols-[1fr_280px]">
          {/* ── graph ── */}
          <div className="relative border border-line-soft bg-void/60">
            <div className="relative flex items-center justify-between border-b border-line-soft px-3 py-2">
              <span className="font-tech text-[0.55rem] tracking-[0.2em] text-mute/60">
                GRAPH // PARTICIPATION TOPOLOGY
              </span>
              <button
                type="button"
                onClick={reset}
                disabled={!selection}
                className={cn(
                  'font-tech flex items-center gap-1.5 border px-2 py-1 text-[0.55rem] tracking-[0.16em] transition-colors',
                  selection
                    ? 'border-neon/40 text-neon hover:bg-neon/10'
                    : 'cursor-not-allowed border-line/60 text-mute/40',
                )}
              >
                <RotateCcw size={9} aria-hidden="true" />
                RESET
              </button>
            </div>

            <div className="relative">
              <svg
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                className="h-auto w-full"
                role="group"
                aria-label="Operative and mission relationship network"
              >
                {/* interference band */}
                <defs>
                  <pattern id="gp-scan" width="4" height="4" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="4" y2="0" stroke="rgba(57,255,20,0.05)" strokeWidth="1" />
                  </pattern>
                  <radialGradient id="gp-node-glow">
                    <stop offset="0%" stopColor="rgba(57,255,20,0.22)" />
                    <stop offset="100%" stopColor="rgba(57,255,20,0)" />
                  </radialGradient>
                </defs>
                <rect width={VIEW_W} height={VIEW_H} fill="url(#gp-scan)" />

                {/* edges first so nodes sit above them */}
                <g>
                  {edges.map((edge) => {
                    const lit = isEdgeLit(edge)
                    const dim = lit === false
                    return (
                      <motion.line
                        key={edge.key}
                        x1={edge.x1}
                        y1={edge.y1}
                        x2={edge.x2}
                        y2={edge.y2}
                        stroke={lit ? '#39FF14' : edge.active ? 'rgba(57,255,20,0.26)' : 'rgba(145,163,151,0.15)'}
                        strokeWidth={lit ? 1.6 : 1}
                        strokeDasharray={edge.active ? '5 5' : undefined}
                        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        viewport={{ once: true, amount: 'some', margin: '160% 0px 15% 0px' }}
                        transition={{ duration: reduce ? 0 : 1.1, ease: EASE_OUT_EXPO, delay: reduce ? 0 : 0.2 }}
                        style={{ opacity: dim ? 0.18 : 1, transition: 'opacity 300ms, stroke 300ms' }}
                      >
                        {edge.active && !reduce && !dim && (
                          <animate
                            attributeName="stroke-dashoffset"
                            from="20"
                            to="0"
                            dur="1.4s"
                            repeatCount="indefinite"
                          />
                        )}
                      </motion.line>
                    )
                  })}
                </g>

                {/* operative nodes */}
                <g>
                  {operativePoints.map(({ operative, x, y }) => {
                    const lit = operativeLit(operative.codename)
                    const selected = selection?.type === 'operative' && selection.id === operative.codename
                    return (
                      <g
                        key={operative.number}
                        transform={`translate(${x} ${y})`}
                        role="button"
                        tabIndex={0}
                        aria-pressed={selected}
                        aria-label={`Operative ${operative.codename} — ${operative.designation}. ${operative.missions.length} confirmed operations.`}
                        className="cursor-pointer outline-none"
                        onClick={() => handleOperativeClick(operative.codename)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            handleOperativeClick(operative.codename)
                          }
                        }}
                        onMouseEnter={() => setHover({ type: 'operative', id: operative.codename })}
                        onMouseLeave={() => setHover(null)}
                        onFocus={() => setHover({ type: 'operative', id: operative.codename })}
                        onBlur={() => setHover(null)}
                        style={{ opacity: lit ? 1 : 0.32, transition: 'opacity 300ms' }}
                      >
                        {selected && <circle r={46} fill="url(#gp-node-glow)" />}
                        <circle
                          r={26}
                          fill="#050706"
                          stroke={selected ? '#39FF14' : 'rgba(57,255,20,0.45)'}
                          strokeWidth={selected ? 2 : 1}
                          className="transition-[stroke-width] duration-300"
                        />
                        <motion.circle
                          r={26}
                          fill="none"
                          stroke="rgba(57,255,20,0.35)"
                          strokeWidth="1"
                          strokeDasharray="3 5"
                          style={{ transformOrigin: 'center' }}
                          animate={reduce ? undefined : { rotate: 360 }}
                          transition={
                            reduce
                              ? undefined
                              : { duration: 26, repeat: Infinity, ease: 'linear' }
                          }
                        />
                        <text
                          textAnchor="middle"
                          y="4"
                          className="font-tech"
                          style={{
                            fill: selected ? '#39FF14' : '#E8F5E9',
                            fontSize: 13,
                            letterSpacing: '0.08em',
                            fontWeight: 500,
                          }}
                        >
                          {operative.codename.slice(0, 2)}
                        </text>
                        <text
                          textAnchor="middle"
                          y="44"
                          style={{
                            fill: selected ? '#39FF14' : 'rgba(232,245,233,0.72)',
                            fontSize: 10,
                            letterSpacing: '0.18em',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {operative.codename}
                        </text>
                      </g>
                    )
                  })}
                </g>

                {/* mission nodes */}
                <g>
                  {missionPoints.map(({ mission, x, y }) => {
                    const lit = missionLit(mission.id)
                    const selected = selection?.type === 'mission' && selection.id === mission.id
                    const active = statusDisplay[mission.status].active
                    return (
                      <g
                        key={mission.id}
                        transform={`translate(${x} ${y})`}
                        role="button"
                        tabIndex={0}
                        aria-pressed={selected}
                        aria-label={`${mission.title} — ${statusDisplay[mission.status].label}${
                          mission.operationType === 'SOLO' ? ', solo operation' : ''
                        }.`}
                        className="cursor-pointer outline-none"
                        onClick={() => handleMissionClick(mission.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            handleMissionClick(mission.id)
                          }
                        }}
                        onMouseEnter={() => setHover({ type: 'mission', id: mission.id })}
                        onMouseLeave={() => setHover(null)}
                        onFocus={() => setHover({ type: 'mission', id: mission.id })}
                        onBlur={() => setHover(null)}
                        style={{ opacity: lit ? 1 : 0.3, transition: 'opacity 300ms' }}
                      >
                        <rect
                          x={-58}
                          y={-15}
                          width={116}
                          height={30}
                          rx={2}
                          fill="#0A100C"
                          stroke={selected ? '#39FF14' : active ? 'rgba(57,255,20,0.4)' : 'rgba(145,163,151,0.3)'}
                          strokeWidth={selected ? 2 : 1}
                        />
                        <text
                          textAnchor="middle"
                          y={-2}
                          style={{
                            fill: selected ? '#39FF14' : 'rgba(232,245,233,0.9)',
                            fontSize: 9.5,
                            letterSpacing: '0.06em',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {mission.codename}
                        </text>
                        <text
                          textAnchor="middle"
                          y={9}
                          style={{
                            fill: active ? 'rgba(57,255,20,0.85)' : 'rgba(0,200,83,0.85)',
                            fontSize: 7.5,
                            letterSpacing: '0.14em',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {mission.operationType === 'SOLO' ? 'SOLO · ' : ''}
                          {statusDisplay[mission.status].label}
                        </text>
                      </g>
                    )
                  })}
                </g>
              </svg>

              {/* hover / selection readout */}
              <div className="pointer-events-none absolute inset-x-2 bottom-2 sm:inset-x-3">
                <AnimatePresence mode="wait">
                  {hoverLabel && (
                    <motion.div
                      key={hoverLabel.title}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: reduce ? 0 : 0.25 }}
                      className="border border-neon/25 bg-black/85 px-2.5 py-2 backdrop-blur-sm"
                    >
                      <p className="font-tech text-[0.6rem] tracking-[0.16em] text-neon">{hoverLabel.title}</p>
                      <p className="font-tech mt-0.5 text-[0.52rem] tracking-[0.14em] text-mute/70">
                        {hoverLabel.meta}
                      </p>
                      <p className="font-tech mt-0.5 text-[0.52rem] tracking-[0.14em] text-mute/55">
                        {hoverLabel.detail}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ── inspector ── */}
          <div className="border border-line-soft bg-card/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-tech text-[0.55rem] tracking-[0.2em] text-mute/60">NODE INSPECTOR</span>
              {selection && (
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Clear selection"
                  className="text-mute/60 transition-colors hover:text-neon"
                >
                  <X size={11} aria-hidden="true" />
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {!selection && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  <p className="font-tech text-[0.58rem] leading-relaxed tracking-[0.14em] text-mute/55">
                    SELECT A NODE TO TRACE THE NETWORK.
                  </p>
                  <ul className="space-y-1 border-t border-line-soft pt-2">
                    {activeOperatives.map((operative) => (
                      <li key={operative.number}>
                        <button
                          type="button"
                          onClick={() => setSelection({ type: 'operative', id: operative.codename })}
                          className="font-tech flex w-full items-center justify-between gap-2 py-0.5 text-[0.58rem] tracking-[0.14em] text-mute/70 transition-colors hover:text-neon"
                        >
                          <span>{operative.codename}</span>
                          <span className="tabular-nums text-mute/40">
                            {String(operative.missions.length).padStart(2, '0')}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {selectedOperative && (
                <motion.div
                  key={selectedOperative.codename}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.3 }}
                >
                  <p className="font-display text-[1.15rem] font-medium uppercase leading-none tracking-[-0.02em] text-bone">
                    {selectedOperative.codename}
                  </p>
                  <p className="font-tech mt-1 text-[0.55rem] tracking-[0.16em] text-neon/80">
                    {selectedOperative.designation}
                  </p>
                  <p className="font-tech mt-0.5 text-[0.55rem] tracking-[0.14em] text-mute/60">
                    {selectedOperative.role}
                  </p>
                  <ul className="mt-3 space-y-1 border-t border-line-soft pt-2">
                    {selectedOperative.missions.map((id) => {
                      const mission = archive.find((m) => m.id === id)
                      if (!mission) return null
                      return (
                        <li key={id} className="flex items-baseline justify-between gap-2">
                          <span className="font-tech text-[0.56rem] tracking-[0.1em] text-bone/80">
                            {mission.title}
                          </span>
                          <span
                            className={cn(
                              'font-tech text-[0.5rem] tracking-[0.14em]',
                              statusDisplay[mission.status].active ? 'text-neon' : 'text-emerald',
                            )}
                          >
                            {statusDisplay[mission.status].label}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                  <button
                    type="button"
                    onClick={() => openDossier(selectedOperative.codename)}
                    className="font-tech mt-3 w-full border border-neon/40 px-3 py-2 text-[0.56rem] tracking-[0.18em] text-neon transition-colors hover:bg-neon/10"
                  >
                    OPEN DOSSIER
                  </button>
                </motion.div>
              )}

              {selectedMission && (
                <motion.div
                  key={selectedMission.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.3 }}
                >
                  <p className="font-display text-[1.05rem] font-medium uppercase leading-tight tracking-[-0.02em] text-bone">
                    {selectedMission.title}
                  </p>
                  <p className="font-tech mt-1 text-[0.55rem] tracking-[0.16em] text-neon/80">
                    {statusDisplay[selectedMission.status].label}
                    {selectedMission.operationType === 'SOLO' && ' // SOLO OPERATION'}
                  </p>
                  <p className="font-tech mt-3 text-[0.52rem] tracking-[0.16em] text-mute/50">
                    ASSIGNED OPERATIVES
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {activeOperatives
                      .filter((operative) => operative.missions.includes(selectedMission.id))
                      .map((operative) => (
                        <li key={operative.number}>
                          <button
                            type="button"
                            onClick={() => setSelection({ type: 'operative', id: operative.codename })}
                            className="font-tech text-[0.58rem] tracking-[0.14em] text-bone/80 transition-colors hover:text-neon"
                          >
                            {operative.codename}
                          </button>
                        </li>
                      ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
