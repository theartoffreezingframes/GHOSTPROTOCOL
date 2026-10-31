/**
 * ═══════════════════════════════════════════════════════════════
 * GHOST PROTOCOL // OPERATIVE DATABASE
 * ═══════════════════════════════════════════════════════════════
 * Central source of truth for the three core operatives.
 *
 * TO EDIT:
 *  • `socials`  — set `href` to a real URL, or leave `null` to keep
 *                 the channel hidden. Never a placeholder address.
 *  • `skills`   — add only technologies the operative actually uses.
 *  • `image`    — replace the file in /src/assets/raw using the same
 *                 name and run `npm run optimize:images`.
 *
 * Codenames, names, designations and roles are official — do not
 * change their spelling.
 */
import { MEDIA, type MediaAsset } from '../lib/media'

export type SocialPlatform = 'github' | 'linkedin' | 'instagram' | 'x' | 'email' | 'website'

export type OperativeSocial = {
  platform: SocialPlatform
  /** Real destination only — never a placeholder. Empty means the channel stays hidden. */
  href: string
  label: string
}

export type Operative = {
  /** Official operative number, 001–003. */
  number: string
  codename: string
  fullName: string
  designation: string
  role: string
  profile: string
  /** Short tactical brief shown on hover / focus. */
  brief: string
  /** Keyword triple used for the identity labels. */
  traits: [string, string, string]
  image: MediaAsset
  /** Optional accent (hex) — all three stay inside the sanctioned palette. */
  accent: string
  socials: OperativeSocial[]
  skills: string[]
  /** Visual character treatment applied in the card. */
  signature: 'command' | 'intelligence' | 'stealth'
}

export const operatives: Operative[] = [
  {
    number: '001',
    codename: 'GHOST',
    fullName: 'AKSHAY RAJU OMKARAM',
    designation: 'THE INVISIBLE OPERATOR',
    role: 'LEAD OPERATOR',
    profile:
      'The leader behind Ghost Protocol. Coordinates the team, directs operations, drives strategic decisions and keeps the mission moving forward.',
    brief: 'Command authority. Directs every operation from the shadows.',
    traits: ['COMMAND', 'STRATEGY', 'DIRECTION'],
    image: MEDIA.operativeGhost,
    accent: '#39FF14',
    socials: [],
    skills: [],
    signature: 'command',
  },
  {
    number: '002',
    codename: 'SHADOW',
    fullName: 'VARUN VEERAPALLY',
    designation: 'THE TECH MASTERMIND',
    role: 'HACKER',
    profile:
      'The technical mastermind behind the shadows. Focused on hacking, technical exploration, problem-solving and overcoming complex digital challenges.',
    brief: 'Technical intelligence. Breaks down complex digital problems.',
    traits: ['INTELLIGENCE', 'EXPLOITATION', 'RESEARCH'],
    image: MEDIA.operativeShadow,
    accent: '#00C853',
    socials: [],
    skills: [],
    signature: 'intelligence',
  },
  {
    number: '003',
    codename: 'PHANTOM',
    fullName: 'SREEKAR KETHA',
    designation: 'THE UNTRACEABLE HACKER',
    role: 'TECH OPERATIVE',
    profile:
      'The untraceable technical operative. Focused on technical exploration, hacking challenges and mission execution.',
    brief: 'Field execution. Untraceable in approach, precise in delivery.',
    traits: ['STEALTH', 'EXECUTION', 'FIELD OPS'],
    image: MEDIA.operativePhantom,
    accent: '#39FF14',
    socials: [],
    skills: [],
    signature: 'stealth',
  },
]

export const operativeMeta = {
  count: String(operatives.length).padStart(2, '0'),
  note: 'Core unit. Exactly three operatives hold protocol clearance.',
}
