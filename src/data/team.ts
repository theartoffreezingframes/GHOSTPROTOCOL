/**
 * ═══════════════════════════════════════════════════════════════
 * GHOST PROTOCOL // OPERATIVE DATABASE
 * ═══════════════════════════════════════════════════════════════
 * Central source of truth for every published operative.
 *
 * The section derives its count, headline and grid from this array —
 * add or remove a record and the layout reflows automatically.
 *
 * TO EDIT:
 *  • `socials`     — set `href` to a real URL, or leave empty to keep
 *                    the channel hidden. Never a placeholder address.
 *  • `skills`      — add only technologies the operative actually uses.
 *  • `image`       — replace the file in /src/assets/raw using the same
 *                    name and run `npm run optimize:images`.
 *  • `published`   — set false to pull a record without deleting it.
 *
 * `profile` fields are creative, public-facing character copy — they are
 * NOT claims of verified professional experience, qualifications or
 * achievements. Nothing here is a credential.
 *
 * Codenames, names, designations and roles are official — do not
 * change their spelling.
 */
import { MEDIA, type MediaAsset } from '../lib/media'
import { missions, statusDisplay, type Mission, type MissionId } from './missions'

export type SocialPlatform = 'github' | 'linkedin' | 'instagram' | 'x' | 'email' | 'website'

export type OperativeSocial = {
  platform: SocialPlatform
  /** Real destination only — never a placeholder. Empty means the channel stays hidden. */
  href: string
  label: string
}

/** Visual character treatment applied in the card. */
export type OperativeSignature =
  | 'command'
  | 'intelligence'
  | 'stealth'
  | 'adaptive'
  | 'rogue'
  | 'cadet'

export type Operative = {
  /** Official operative number, zero-padded. */
  number: string
  codename: string
  fullName: string
  designation: string
  role: string
  /** Long-form classified dossier narrative. */
  profile: string
  /** Short tactical brief shown on the card face. */
  brief: string
  /** Standalone capability readout revealed inside the dossier. */
  capabilities: string[]
  /** Where this operative sits in the network map (percentages). */
  node: { x: number; y: number }
  /** Keyword triple used for the identity labels. */
  traits: [string, string, string]
  image: MediaAsset
  /** Optional accent (hex) — all records stay inside the sanctioned palette. */
  accent: string
  socials: OperativeSocial[]
  /**
   * Verified tooling for THIS operative, by tool name. Empty means nothing
   * has been confirmed — the capability matrix renders "PENDING
   * VERIFICATION" rather than assuming anything from rank, codename,
   * mission participation or job description.
   */
  skills: string[]
  signature: OperativeSignature
  /** Set false to withhold a record without deleting it. */
  published: boolean
  /**
   * Confirmed operations this operative took part in, by mission id.
   * Mission name, status and solo classification are looked up from
   * src/data/missions.ts — never typed here.
   */
  missions: MissionId[]
}

export const operatives: Operative[] = [
  {
    number: '001',
    codename: 'GHOST',
    fullName: 'AKSHAY RAJU OMKARAM',
    designation: 'THE INVISIBLE OPERATOR',
    role: 'LEAD OPERATOR',
    profile:
      'Every operation begins with a vision. GHOST is the force behind the protocol — coordinating the team, navigating uncertainty and turning ambitious ideas into executable strategies. Operating behind the scenes, he brings direction, determination and a relentless drive to make the impossible possible.',
    brief: 'Command authority. Directs every operation from the shadows.',
    capabilities: ['Central strategist and team leader', 'Calm under pressure', 'Coordinates operations and team execution', 'The presence behind the protocol'],
    traits: ['COMMAND', 'STRATEGY', 'DIRECTION'],
    image: MEDIA.operativeGhost,
    accent: '#39FF14',
    socials: [],
    skills: [],
    signature: 'command',
    node: { x: 50, y: 12 },
    missions: ['zerosecure-2', 'cyber-ekathon', 'blackout', 'secleaf-2026'],
    published: true,
  },
  {
    number: '002',
    codename: 'SHADOW',
    fullName: 'VARUN VEERAPALLY',
    designation: 'THE TECH MASTERMIND',
    role: 'HACKER',
    profile:
      'Where others see barriers, SHADOW sees entry points. A technical mind operating beyond the obvious, he approaches challenges with precision, curiosity and an instinct for finding unconventional solutions. When the system becomes unpredictable, SHADOW finds another way through.',
    brief: 'Technical intelligence. Breaks down complex digital problems.',
    capabilities: ['Technical mastermind', 'Problem solver', 'Focused on unconventional technical solutions', 'The specialist who works where others cannot see'],
    traits: ['INTELLIGENCE', 'EXPLOITATION', 'RESEARCH'],
    image: MEDIA.operativeShadow,
    accent: '#00C853',
    socials: [],
    skills: [],
    signature: 'intelligence',
    node: { x: 14.5, y: 37 },
    missions: ['zerosecure-2', 'cyber-ekathon', 'secleaf-2026'],
    published: true,
  },
  {
    number: '003',
    codename: 'PHANTOM',
    fullName: 'SREEKAR KETHA',
    designation: 'THE UNTRACEABLE HACKER',
    role: 'TECH OPERATIVE',
    profile:
      'Silent in approach. Precise in execution. PHANTOM represents the art of operating without unnecessary noise. With a focus on technical exploration and methodical problem-solving, he moves through complex challenges while keeping the mission in focus.',
    brief: 'Field execution. Untraceable in approach, precise in delivery.',
    capabilities: ['Stealth-oriented technical operative', 'Methodical problem solver', 'Quiet execution and attention to detail', 'The specialist who leaves minimal traces'],
    traits: ['STEALTH', 'EXECUTION', 'FIELD OPS'],
    image: MEDIA.operativePhantom,
    accent: '#39FF14',
    socials: [],
    skills: [],
    signature: 'stealth',
    node: { x: 85.5, y: 37 },
    missions: ['zerosecure-2', 'secleaf-2026'],
    published: true,
  },
  {
    number: '004',
    codename: 'SPECTRE',
    fullName: 'MOHAMMAD ISMAIL KHAN',
    designation: 'THE ADAPTIVE SPECIALIST',
    role: 'TECHNICAL OPERATIVE',
    profile:
      'Adaptability is the ultimate advantage. SPECTRE quickly absorbs unfamiliar technologies, adjusts to changing situations and brings versatility to the operation. When the mission introduces a new challenge, SPECTRE is ready to learn, adapt and execute.',
    brief: 'Adaptive execution. Absorbs new technology on contact.',
    capabilities: ['Experienced and adaptable', 'Quick learner', 'Versatile technical contributor'],
    traits: ['ADAPTABILITY', 'VERSATILITY', 'RANGE'],
    image: MEDIA.operativeSpectre,
    accent: '#00C853',
    socials: [],
    skills: [],
    signature: 'adaptive',
    node: { x: 25, y: 70 },
    missions: ['cyber-ekathon'],
    published: true,
  },
  {
    number: '005',
    codename: 'ROGUE',
    fullName: 'SNEHITH REDDY NEMALIKONDA',
    designation: 'THE GHOST PROTOCOL OPERATIVE',
    role: 'TECHNICAL OPERATIVE',
    profile:
      'Some operatives wait for the plan. ROGUE writes his own. Working without a net and answerable to no template, he reads a situation as it unfolds and adapts faster than it can change. Independent by instinct, resourceful under pressure and quietly certain of his own read — he takes the assignment other operatives would call impossible and treats it as a starting position.',
    brief: 'Works without a net. Turns an impossible assignment into a starting position.',
    capabilities: [
      'Independent operator who works without close direction',
      'Resourceful under pressure',
      'Adapts to a changing situation as it unfolds',
      'Confident enough to take on assignments others pass over',
    ],
    traits: ['INDEPENDENT', 'RESOURCEFUL', 'ADAPTABLE'],
    image: MEDIA.operativeRogue,
    accent: '#39FF14',
    socials: [],
    skills: [],
    signature: 'rogue',
    node: { x: 44, y: 74 },
    missions: ['secleaf-2026'],
    published: true,
  },
  {
    number: '006',
    codename: 'CADET',
    fullName: 'DILIP KESHAV MADALA',
    designation: 'THE ROOKIE OPERATIVE',
    role: 'TRAINEE',
    profile:
      'Every protocol has a first day. CADET is at the start of his — cleared for the room, not yet cleared for the field. He is learning the shape of the work the way it is actually done here: slowly, carefully and in the company of operatives who have already earned their record. Nothing about him is finished, and he is not pretending otherwise.',
    brief: 'First day on the protocol. Learning the work, not yet cleared for the field.',
    capabilities: [
      'Developing member of the protocol',
      'In structured training under the unit',
      'No operational record yet — progression is the point',
    ],
    traits: ['ROOKIE', 'TRAINING', 'PROGRESSION'],
    image: MEDIA.operativeCadet,
    accent: '#00C853',
    socials: [],
    skills: [],
    signature: 'cadet',
    node: { x: 92, y: 52 },
    missions: [],
    published: true,
  },
]

/* ── Mission history derivation ──────────────────────────────────────
   Operatives store only mission ids. Everything the dossier shows —
   name, current status, solo classification, count — is derived here,
   so changing a status in missions.ts updates every dossier at once.  */

export type OperativeMissionRecord = {
  id: MissionId
  number: string
  codename: string
  title: string
  status: Mission['status']
  statusLabel: string
  active: boolean
  solo: boolean
  /** Operatives sharing this mission (used for the assigned-operator line). */
  assignedCount: number
}

const missionById = new Map(missions.map((mission) => [mission.id, mission]))

function buildMissionHistory(operative: Operative): OperativeMissionRecord[] {
  return operative.missions
    .map((id) => missionById.get(id))
    .filter((mission): mission is Mission => Boolean(mission))
    .map((mission) => {
      const display = statusDisplay[mission.status]
      return {
        id: mission.id,
        number: mission.number,
        codename: mission.codename,
        title: mission.title,
        status: mission.status,
        statusLabel: display.label,
        active: display.active,
        solo: mission.operationType === 'SOLO',
        assignedCount: operatives.filter((other) => other.missions.includes(mission.id)).length,
      }
    })
}

/** Confirmed mission history for one operative, in official mission order. */
export function missionHistory(operative: Operative): OperativeMissionRecord[] {
  return buildMissionHistory(operative)
}

/** True when this operative is the only one assigned to that mission. */
export function isSoloAssignment(operative: Operative, id: MissionId): boolean {
  return (
    operatives.filter((other) => other.missions.includes(id)).length === 1 &&
    operative.missions.includes(id)
  )
}

export const missionHistoryCopy = {
  heading: 'MISSION HISTORY',
  support: 'CLASSIFIED RECORD OF CONFIRMED OPERATIONAL PARTICIPATION.',
  empty: 'NO CONFIRMED OPERATION ON FILE',
  emptyNote:
    'TRAINEE STATUS — NOT YET ASSIGNED. This is an empty record, not a withheld one.',
  soloLabel: 'SOLO OPERATION',
  typeLabel: 'MISSION TYPE',
  assignedLabel: 'ASSIGNED OPERATIVE',
  accessLabel: 'ACCESS',
  accessValue: 'CLASSIFIED',
  participation: 'CONFIRMED',
  countLabel: (n: number) => `${String(n).padStart(2, '0')} CONFIRMED`,
}

/** Published records only — the UI never sees withheld entries. */
export const activeOperatives = operatives.filter((operative) => operative.published)

const NUMBER_WORD: Record<number, string> = {
  1: 'ONE',
  2: 'TWO',
  3: 'THREE',
  4: 'FOUR',
  5: 'FIVE',
  6: 'SIX',
  7: 'SEVEN',
  8: 'EIGHT',
  9: 'NINE',
  10: 'TEN',
}

/** Headline numeral follows the published record count, so the section never lies. */
const operativeWord = NUMBER_WORD[activeOperatives.length] ?? String(activeOperatives.length).padStart(2, '0')

export const operativeMeta = {
  count: String(activeOperatives.length).padStart(2, '0'),
  total: activeOperatives.length,
  label: 'OPERATIVE DATABASE',
  heading: [`${operativeWord} MINDS.`, 'ONE PROTOCOL.'],
  support: 'DIFFERENT SPECIALTIES. ONE OBJECTIVE. NO IMPOSSIBLE MISSIONS.',
  note: 'Six operatives hold protocol clearance. Every dossier below is a character record — not a claim of credential.',
  clearance: 'CLEARANCE',
  dossierNote:
    'CHARACTER DOSSIERS // PORTRAITS ARE ORIGINAL AI-GENERATED ILLUSTRATIONS, NOT PHOTOGRAPHS. PROFILE COPY IS PUBLIC-FACING CHARACTER MATERIAL — NOT A RECORD OF QUALIFICATIONS, EMPLOYMENT OR ACHIEVEMENT.',
}
