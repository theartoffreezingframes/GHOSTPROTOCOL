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

export type NavItem = {
  id: string
  index: string
  label: string
  short: string
  /** Rendered in the bar itself; the rest live behind the SECTIONS menu. */
  primary?: boolean
}

export const nav: NavItem[] = [
  { id: 'protocol', index: '01', label: 'The Protocol', short: 'Protocol', primary: true },
  { id: 'operatives', index: '02', label: 'Operatives', short: 'Operatives', primary: true },
  { id: 'network', index: '03', label: 'Operative Network', short: 'Network', primary: true },
  { id: 'missions', index: '04', label: 'Operations', short: 'Ops', primary: true },
  { id: 'transmissions', index: '05', label: 'Transmissions', short: 'Signals' },
  { id: 'lab', index: '06', label: 'Engineering Lab', short: 'Lab' },
  { id: 'arsenal', index: '07', label: 'Arsenal', short: 'Arsenal', primary: true },
  { id: 'radar', index: '08', label: 'Threat Radar', short: 'Radar' },
  { id: 'timeline', index: '09', label: 'Timeline', short: 'Timeline' },
  { id: 'record', index: '10', label: 'Record', short: 'Record' },
  { id: 'intel', index: '11', label: 'Redacted Files', short: 'Intel' },
  { id: 'contact', index: '12', label: 'Connection', short: 'Connect', primary: true },
]

export const primaryNav = nav.filter((item) => item.primary)
export const secondaryNav = nav.filter((item) => !item.primary)

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

/* ── TECHNICAL ARSENAL 2.0 ──────────────────────────────────────────
   Only technologies already present in this project's arsenal are
   listed. `description` and `docs` stay null unless the detail can be
   verified — the card then shows a classified placeholder instead.
   No expertise levels, certifications or per-operative claims.       */

export type ArsenalGroupId =
  | 'programming'
  | 'security'
  | 'ai'
  | 'tools'
  | 'frameworks'
  | 'platforms'

export type ArsenalTool = {
  id: string
  name: string
  group: ArsenalGroupId
  /** Extra terms that should match in search. */
  aliases: string[]
  description: string | null
  docs: string | null
}

export const arsenalGroups: { id: ArsenalGroupId; index: string; label: string; note: string }[] = [
  { id: 'programming', index: '01', label: 'PROGRAMMING LANGUAGES', note: 'LANGUAGES WE BUILD WITH' },
  { id: 'security', index: '02', label: 'CYBERSECURITY', note: 'OFFENSIVE & DEFENSIVE FOUNDATIONS' },
  { id: 'ai', index: '03', label: 'AI / MACHINE LEARNING', note: 'INTELLIGENCE LAYER' },
  { id: 'frameworks', index: '04', label: 'FRAMEWORKS & LIBRARIES', note: 'INTERFACES & SERVICES' },
  { id: 'tools', index: '05', label: 'DEVELOPMENT TOOLS', note: 'BUILD & SHIP' },
  { id: 'platforms', index: '06', label: 'PLATFORMS & ENVIRONMENTS', note: 'WHERE IT RUNS' },
]

export const arsenalTools: ArsenalTool[] = [
  // programming
  { id: 'python', name: 'Python', group: 'programming', aliases: ['py'], description: null, docs: null },
  { id: 'c', name: 'C', group: 'programming', aliases: [], description: null, docs: null },
  { id: 'cpp', name: 'C++', group: 'programming', aliases: ['cplusplus'], description: null, docs: null },
  { id: 'java', name: 'Java', group: 'programming', aliases: [], description: null, docs: null },
  { id: 'javascript', name: 'JavaScript', group: 'programming', aliases: ['js'], description: null, docs: null },
  { id: 'typescript', name: 'TypeScript', group: 'programming', aliases: ['ts'], description: null, docs: null },
  { id: 'html', name: 'HTML', group: 'programming', aliases: [], description: null, docs: null },
  { id: 'css', name: 'CSS', group: 'programming', aliases: [], description: null, docs: null },

  // security
  { id: 'linux', name: 'Linux', group: 'security', aliases: ['unix'], description: null, docs: null },
  { id: 'networking', name: 'Networking', group: 'security', aliases: ['tcp', 'ip'], description: null, docs: null },
  { id: 'web-security', name: 'Web Security', group: 'security', aliases: ['appsec'], description: null, docs: null },
  { id: 'ctf', name: 'CTF Challenges', group: 'security', aliases: ['capture the flag'], description: null, docs: null },
  { id: 'security-fundamentals', name: 'Security Fundamentals', group: 'security', aliases: [], description: null, docs: null },

  // ai
  { id: 'ai', name: 'Artificial Intelligence', group: 'ai', aliases: ['ai'], description: null, docs: null },
  { id: 'ml', name: 'Machine Learning', group: 'ai', aliases: ['ml'], description: null, docs: null },
  { id: 'llm', name: 'LLMs', group: 'ai', aliases: ['large language models'], description: null, docs: null },
  { id: 'ai-dev', name: 'AI-Powered Development', group: 'ai', aliases: ['assisted coding'], description: null, docs: null },

  // frameworks (already on site: React, Node.js)
  { id: 'react', name: 'React', group: 'frameworks', aliases: ['reactjs'], description: null, docs: null },
  { id: 'node', name: 'Node.js', group: 'frameworks', aliases: ['node', 'nodejs'], description: null, docs: null },
  { id: 'vite', name: 'Vite', group: 'frameworks', aliases: ['build'], description: null, docs: null },
  { id: 'tailwind', name: 'Tailwind CSS', group: 'frameworks', aliases: ['tailwind'], description: null, docs: null },

  // tools (present in this repo's own toolchain)
  { id: 'git', name: 'Git', group: 'tools', aliases: ['version control'], description: null, docs: null },
  { id: 'vitest', name: 'TypeScript Compiler', group: 'tools', aliases: ['tsc', 'typecheck'], description: null, docs: null },
  { id: 'sharp', name: 'Sharp', group: 'tools', aliases: ['image pipeline'], description: null, docs: null },

  // platforms
  { id: 'browser', name: 'Web Browsers', group: 'platforms', aliases: ['web'], description: null, docs: null },
  { id: 'vercel', name: 'Vercel', group: 'platforms', aliases: ['deploy', 'hosting'], description: null, docs: null },
]

export const arsenalCopy = {
  heading: ['OUR TOOLS.', 'OUR CAPABILITIES.'],
  label: 'TECHNICAL ARSENAL',
  search: 'SEARCH ARSENAL',
  searchPlaceholder: 'FILTER BY TECHNOLOGY…',
  all: 'ALL',
  empty: 'NO MATCH IN ARSENAL',
  emptyNote: 'No technology on this list matches that filter.',
  classified: 'DETAILS NOT PROVIDED',
  docs: 'OFFICIAL DOCUMENTATION',
  results: (n: number) => `${String(n).padStart(2, '0')} TECHNOLOGIES`,
}

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
