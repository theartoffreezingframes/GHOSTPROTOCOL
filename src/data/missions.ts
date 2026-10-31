/**
 * ═══════════════════════════════════════════════════════════════
 * GHOST PROTOCOL // OPERATIONS DATABASE
 * ═══════════════════════════════════════════════════════════════
 * Official mission names and their current status:
 *   001  OPERATION ZEROSECURE 2.0  — COMPLETED
 *   002  OPERATION CYBER EKATHON   — COMPLETED
 *   003  OPERATION BLACKOUT        — ONGOING
 *   004  SECLEAF 2026              — ONGOING
 *
 * Status labels, ordering, counts and the archive telemetry are all
 * derived from this array — change a `status` here and every badge,
 * heading and counter in the UI follows. Nothing is hardcoded twice.
 *
 * Every narrative field below is editable and starts as a clearly
 * marked placeholder. No date, venue, objective, result or achievement
 * is invented — fill it in when it is cleared.
 */
import { MEDIA, type MediaAsset } from '../lib/media'
import { operativeMeta } from './team'

export type MissionStatus = 'COMPLETED' | 'ONGOING' | 'UPCOMING'

export type MissionField = {
  label: string
  /** null / empty renders the classified placeholder. */
  value: string | null
}

export type Mission = {
  number: string
  codename: string
  title: string
  event: string | null
  status: MissionStatus
  /** ISO date string once confirmed — null renders "AWAITING INTEL". */
  date: string | null
  venue: string | null
  summary: string | null
  image: MediaAsset | null
  /** Extra narrative blocks revealed in the expandable record. */
  dossier: MissionField[]
  /** Results / achievements — only list what can be verified. */
  outcomes: string[]
  tags: string[]
  /** Renders as the full-bleed classified centrepiece instead of an archive row. */
  feature?: boolean
  /** Set false to withhold a record without deleting it. */
  published?: boolean
}

/* ── Status display contract ─────────────────────────────────────────
   Single place that maps a status to its label, colour tone and the
   supporting line used across cards, telemetry and the record rail.  */
export const statusDisplay: Record<
  MissionStatus,
  { label: string; tone: 'complete' | 'online'; note: string; active: boolean }
> = {
  COMPLETED: {
    label: 'COMPLETED',
    tone: 'complete',
    note: 'Declassified. Record sealed.',
    active: false,
  },
  ONGOING: {
    label: 'ONGOING',
    tone: 'online',
    note: 'Operation live. Signals open.',
    active: true,
  },
  UPCOMING: {
    label: 'UPCOMING',
    tone: 'online',
    note: 'Scheduled. Awaiting deployment.',
    active: true,
  },
}

export const missions: Mission[] = [
  {
    number: '001',
    codename: 'ZEROSECURE',
    title: 'OPERATION ZEROSECURE 2.0',
    event: 'ZeroSecure 2.0',
    status: 'COMPLETED',
    date: null,
    venue: null,
    summary: null,
    image: MEDIA.missionZeroSecure,
    dossier: [
      { label: 'EVENT DESCRIPTION', value: null },
      { label: 'TEAM PARTICIPATION', value: null },
      { label: 'COMPETITION DETAILS', value: null },
      { label: 'CHALLENGES', value: null },
      { label: 'EXPERIENCE GAINED', value: null },
      { label: 'RESULTS & ACHIEVEMENTS', value: null },
    ],
    outcomes: [],
    tags: ['SECURITY', 'HACKATHON'],
    published: true,
  },
  {
    number: '002',
    codename: 'EKATHON',
    title: 'OPERATION CYBER EKATHON',
    event: 'Cyber Ekathon',
    status: 'COMPLETED',
    date: null,
    venue: null,
    summary: null,
    image: MEDIA.missionCyberEkathon,
    dossier: [
      { label: 'EVENT DESCRIPTION', value: null },
      { label: 'PARTICIPATION DETAILS', value: null },
      { label: 'PROBLEM STATEMENTS', value: null },
      { label: 'TEAM ACTIVITIES', value: null },
      { label: 'PROJECTS & SOLUTIONS', value: null },
      { label: 'RESULTS & ACHIEVEMENTS', value: null },
    ],
    outcomes: [],
    tags: ['HACKATHON', 'BUILD'],
    published: true,
  },
  {
    number: '003',
    codename: 'BLACKOUT',
    title: 'OPERATION BLACKOUT',
    event: null,
    status: 'ONGOING',
    date: null,
    venue: null,
    summary: null,
    image: MEDIA.missionBlackout,
    dossier: [
      { label: 'MISSION BRIEF', value: null },
      { label: 'DATE', value: null },
      { label: 'VENUE', value: null },
      { label: 'OBJECTIVES', value: null },
      { label: 'OPERATIVES ASSIGNED', value: operativeMeta.count },
      { label: 'ACCESS LEVEL', value: 'CLASSIFIED' },
    ],
    outcomes: [],
    tags: ['ACTIVE', 'CLASSIFIED'],
    feature: true,
    published: true,
  },
  {
    number: '004',
    codename: 'SECLEAF',
    title: 'SECLEAF 2026',
    event: null,
    status: 'ONGOING',
    date: null,
    venue: null,
    summary: null,
    image: MEDIA.missionSecleaf,
    dossier: [
      { label: 'MISSION BRIEF', value: null },
      { label: 'DATE', value: null },
      { label: 'VENUE', value: null },
      { label: 'OBJECTIVES', value: null },
      { label: 'OPERATIVES ASSIGNED', value: operativeMeta.count },
      { label: 'ACCESS LEVEL', value: 'CLASSIFIED' },
    ],
    outcomes: [],
    tags: ['ACTIVE', 'BRIEFING'],
    published: true,
  },
]

/** Published records only. */
export const archive = missions.filter((mission) => mission.published !== false)

/** The centrepiece classified tile (falls back to the last record). */
export const featureMission: Mission = archive.find((mission) => mission.feature) ?? archive[archive.length - 1]

/** Standard archive rows — everything that is not the centrepiece. */
export const archiveRows = archive.filter((mission) => mission !== featureMission)

export const statusCounts = {
  completed: archive.filter((m) => m.status === 'COMPLETED').length,
  ongoing: archive.filter((m) => m.status === 'ONGOING').length,
  upcoming: archive.filter((m) => m.status === 'UPCOMING').length,
  total: archive.length,
  active: archive.filter((m) => statusDisplay[m.status].active).length,
}

const pad = (n: number) => String(n).padStart(2, '0')

export const blackoutCopy = {
  headline: ['THE OPERATION', 'IS LIVE.'],
  glitchWord: 'BLACKOUT',
  support: ['THE SYSTEM IS GOING DARK.', 'THE MISSION IS ALREADY IN MOTION.'],
  cta: 'ACCESS CLASSIFIED FILE',
  encrypted: ['MISSION DETAILS ENCRYPTED.', 'AWAITING AUTHORIZATION.'],
  /** Rendered from `featureMission` — never typed in twice. */
  status: (mission: Mission) => [
    { label: 'MISSION STATUS', value: statusDisplay[mission.status].label },
    { label: 'OPERATION', value: mission.codename },
    { label: 'ACCESS', value: 'CLASSIFIED' },
    { label: 'OPERATIVES', value: operativeMeta.count },
  ],
  operativesAssigned: (mission: Mission) =>
    mission.dossier.find((field) => field.label === 'OPERATIVES ASSIGNED')?.value ?? '—',
  strip: {
    file: (mission: Mission) => `FILE ${mission.number} // ${mission.codename}`,
    state: (mission: Mission) =>
      statusDisplay[mission.status].active ? 'OPERATION ACTIVE · SIGNAL OPEN' : 'OPERATION CLOSED · ARCHIVED',
  },
  placeholder: 'AWAITING INTEL',
}

export const missionMeta = {
  label: 'CLASSIFIED OPERATIONS',
  heading: ['THE MISSIONS', 'DEFINE US.'],
  note: `${pad(statusCounts.completed)} operations archived. ${pad(statusCounts.active)} still in motion.`,
  archiveLabel: 'ARCHIVE',
  liveLabel: 'LIVE OPERATIONS',
  showArchived: 'SHOW ARCHIVED',
}
