/**
 * ═══════════════════════════════════════════════════════════════
 * GHOST PROTOCOL // OPERATIONS DATABASE
 * ═══════════════════════════════════════════════════════════════
 * Mission names and statuses are official — do not change them:
 *   001  OPERATION ZEROSECURE 2.0  — COMPLETED
 *   002  OPERATION CYBER EKATHON   — COMPLETED
 *   003  OPERATION BLACKOUT        — UPCOMING
 *
 * Every narrative field below is editable and starts as a clearly
 * marked placeholder. Nothing about Blackout (date, venue,
 * objectives, results) is invented — fill it in when cleared.
 */
import { MEDIA, type MediaAsset } from '../lib/media'

export type MissionStatus = 'COMPLETED' | 'UPCOMING'

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
  },
  {
    number: '003',
    codename: 'BLACKOUT',
    title: 'OPERATION BLACKOUT',
    event: null,
    status: 'UPCOMING',
    date: null,
    venue: null,
    summary: null,
    image: MEDIA.missionBlackout,
    dossier: [
      { label: 'MISSION BRIEF', value: null },
      { label: 'DATE', value: null },
      { label: 'VENUE', value: null },
      { label: 'OBJECTIVES', value: null },
      { label: 'OPERATIVES ASSIGNED', value: '03' },
      { label: 'ACCESS LEVEL', value: 'CLASSIFIED' },
    ],
    outcomes: [],
    tags: ['NEXT', 'CLASSIFIED'],
  },
]

export const blackoutCopy = {
  headline: ['THE NEXT OPERATION', 'IS UNKNOWN.'],
  glitchWord: 'BLACKOUT',
  support: ['THE SYSTEM IS GOING DARK.', 'A NEW MISSION IS APPROACHING.'],
  cta: 'ACCESS CLASSIFIED FILE',
  encrypted: ['MISSION DETAILS ENCRYPTED.', 'AWAITING AUTHORIZATION.'],
  status: [
    { label: 'MISSION STATUS', value: 'UPCOMING' },
    { label: 'OPERATION', value: 'BLACKOUT' },
    { label: 'ACCESS', value: 'CLASSIFIED' },
    { label: 'OPERATIVES', value: '03' },
  ],
  placeholder: 'AWAITING INTEL',
}

export const missionMeta = {
  label: 'CLASSIFIED OPERATIONS',
  heading: ['THE MISSIONS', 'DEFINE US.'],
  note: 'Two operations archived. One pending deployment.',
}
