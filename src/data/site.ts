/**
 * ═══════════════════════════════════════════════════════════════
 * GHOST PROTOCOL // SITE CONFIGURATION
 * ═══════════════════════════════════════════════════════════════
 * One file to edit the brand copy, contact channels, arsenal and
 * verified record. Anything set to `null` renders as a clearly
 * marked classified placeholder instead of an invented value.
 *
 * Counters (operatives / operations / status split) are NOT typed in
 * here — they are derived from src/data/team.ts and src/data/missions.ts
 * further down so a record change updates the whole page at once.
 */
import { operativeMeta } from './team'
import { statusCounts } from './missions'

export const brand = {
  name: 'GHOST PROTOCOL',
  nameParts: ['GHOST', 'PROTOCOL'],
  short: 'GP',
  classification: 'INDEPENDENT CYBER COLLECTIVE',
  eyebrow: 'GHOST PROTOCOL // INDEPENDENT CYBER COLLECTIVE',
  tagline: 'WE ARE THE GHOSTS IN THE MACHINE.',
  signature: 'GHOST_PROTOCOL_',
  statements: ['THINK BEYOND LIMITS.', 'OPERATE IN THE SHADOWS.', 'BUILD THE IMPOSSIBLE.'],
  philosophy: ['THINK DIFFERENT.', 'BUILD FEARLESSLY.', 'OPERATE BEYOND LIMITS.'],
  established: null as number | null,
} as const

export type NavItem = { id: string; index: string; label: string; short: string }

export const nav: NavItem[] = [
  { id: 'protocol', index: '01', label: 'The Protocol', short: 'Protocol' },
  { id: 'operatives', index: '02', label: 'Operatives', short: 'Operatives' },
  { id: 'missions', index: '03', label: 'Operations', short: 'Ops' },
  { id: 'lab', index: '04', label: 'Engineering Lab', short: 'Lab' },
  { id: 'arsenal', index: '05', label: 'Arsenal', short: 'Arsenal' },
  { id: 'record', index: '06', label: 'Record', short: 'Record' },
  { id: 'contact', index: '07', label: 'Connection', short: 'Connect' },
]

export const hero = {
  headline: ['WE ARE THE GHOSTS', 'IN THE MACHINE.'],
  support: ['Invisible to the ordinary.', 'Unstoppable in execution.', 'Relentless in innovation.'],
  description:
    'A collective of digital explorers, developers and technical minds challenging boundaries and building beyond expectations.',
  primaryCta: 'ENTER THE PROTOCOL',
  secondaryCta: 'EXPLORE OUR OPERATIONS',
  status: [
    { label: 'SYSTEM STATUS', value: 'ONLINE', state: 'online' as const },
    { label: 'OPERATIVES', value: operativeMeta.count, state: 'neutral' as const },
    { label: 'SECURITY LEVEL', value: 'CLASSIFIED', state: 'alert' as const },
  ],
}

export const boot = {
  title: 'GHOST PROTOCOL',
  subtitle: 'INITIALIZING SYSTEM...',
  lines: [
    'ESTABLISHING SECURE CONNECTION...',
    'LOADING OPERATIVE DATABASE...',
    'VERIFYING AUTHORIZATION...',
  ],
  granted: 'ACCESS GRANTED.',
  skip: 'SKIP SEQUENCE',
  signed:
    'AUTH // 0x7F3A // CHANNEL ENCRYPTED // NODE 03 ONLINE',
}

export const about = {
  index: '01',
  label: 'THE PROTOCOL',
  heading: ['NOT JUST A TEAM.', 'A PROTOCOL.'],
  body: [
    'Ghost Protocol is a team of technology enthusiasts, developers, cybersecurity explorers and problem-solvers driven by curiosity, creativity and technical ambition.',
    'We explore the digital world, challenge conventional thinking, participate in competitive environments and transform ambitious ideas into real solutions.',
  ],
  stats: [
    { label: 'OPERATIVES', value: operativeMeta.count, note: 'ACTIVE' },
    { label: 'OPERATIONS', value: String(statusCounts.total).padStart(2, '0'), note: 'TOTAL' },
    { label: 'COMPLETED', value: String(statusCounts.completed).padStart(2, '0'), note: 'ARCHIVED' },
    { label: 'ACTIVE', value: String(statusCounts.active).padStart(2, '0'), note: 'LIVE' },
  ],
}

/* ------------------------------------------------------------------
   CONTACT — supplied values only.
   Replace `null` with a real URL / address to activate a channel.
   Example:  github: 'https://github.com/your-handle'
   ------------------------------------------------------------------ */
export type ChannelKey = 'github' | 'linkedin' | 'instagram' | 'email'

export type Channel = {
  key: ChannelKey
  label: string
  handle: string | null
  href: string | null
}

export const contact = {
  index: '07',
  label: 'ESTABLISH CONNECTION',
  heading: ['EVERY PROTOCOL', 'HAS AN ENTRY POINT.'],
  support: 'Have an idea, challenge or mission worth pursuing?',
  invite: 'Connect with Ghost Protocol.',
  channels: [
    { key: 'github', label: 'GitHub', handle: null, href: null },
    { key: 'linkedin', label: 'LinkedIn', handle: null, href: null },
    { key: 'instagram', label: 'Instagram', handle: null, href: null },
    { key: 'email', label: 'Email', handle: null, href: null },
  ] satisfies Channel[],
  closing: ['CONNECTION ESTABLISHED.', 'PROTOCOL REMAINS ACTIVE.', 'SEE YOU ON THE OTHER SIDE.'],
  pendingLabel: 'CHANNEL PENDING',
}

/* ------------------------------------------------------------------
   TECHNICAL ARSENAL
   Example categories & technologies as supplied in the brief.
   Edit freely — these describe the team's tooling landscape, not
   an individual member's claimed mastery.
   ------------------------------------------------------------------ */
export type ArsenalCategory = {
  id: string
  index: string
  title: string
  note: string
  items: string[]
}

export const arsenal: ArsenalCategory[] = [
  {
    id: 'programming',
    index: '01',
    title: 'PROGRAMMING',
    note: 'LANGUAGES WE BUILD WITH',
    items: ['Python', 'C', 'C++', 'Java', 'JavaScript'],
  },
  {
    id: 'web',
    index: '02',
    title: 'WEB DEVELOPMENT',
    note: 'INTERFACES & SERVICES',
    items: ['HTML', 'CSS', 'React', 'Node.js'],
  },
  {
    id: 'security',
    index: '03',
    title: 'CYBERSECURITY',
    note: 'OFFENSIVE & DEFENSIVE FOUNDATIONS',
    items: ['Linux', 'Networking', 'Web Security', 'CTF Challenges', 'Security Fundamentals'],
  },
  {
    id: 'ai',
    index: '04',
    title: 'AI & TECHNOLOGY',
    note: 'INTELLIGENCE LAYER',
    items: ['Artificial Intelligence', 'Machine Learning', 'LLMs', 'AI-Powered Development'],
  },
]

export const arsenalDisclaimer =
  'Capability map, not a claim of individual mastery — every operative specialises differently.'

/* ------------------------------------------------------------------
   RECORD OF OPERATIONS
   Only verified entries are listed. `verified: false` entries are
   never rendered; add real awards / certifications here once
   confirmed.
   ------------------------------------------------------------------ */
export type RecordEntry = {
  id: string
  year: string | null
  type: 'HACKATHON' | 'CTF' | 'AWARD' | 'CERTIFICATION' | 'MILESTONE' | 'RECOGNITION'
  title: string
  detail: string | null
  verified: boolean
}

export const records: RecordEntry[] = [
  {
    id: 'record-zerosecure',
    year: null,
    type: 'HACKATHON',
    title: 'ZeroSecure 2.0',
    detail: 'Field operation completed with the full operative unit.',
    verified: true,
  },
  {
    id: 'record-ekathon',
    year: null,
    type: 'HACKATHON',
    title: 'Cyber Ekathon',
    detail: 'Field operation completed with the full operative unit.',
    verified: true,
  },
  {
    id: 'record-blackout',
    year: null,
    type: 'MILESTONE',
    title: 'Operation Blackout',
    detail: 'Live operation. Details remain classified.',
    verified: true,
  },
  {
    id: 'record-secleaf',
    year: null,
    type: 'MILESTONE',
    title: 'SECLEAF 2026',
    detail: 'Live operation. Briefing remains classified.',
    verified: true,
  },
]

export const recordEmptyNote =
  'Further entries are withheld until verified. No rankings, awards or certifications are claimed without record.'
