/**
 * ═══════════════════════════════════════════════════════════════
 * GHOST PROTOCOL // INTELLIGENCE CONTENT
 * ═══════════════════════════════════════════════════════════════
 * Copy for the transmissions feed, the redacted intelligence files
 * and the protocol timeline.
 *
 * GROUND RULES — keep these when editing:
 *  • Every transmission here is explicitly marked FICTIONAL in the UI.
 *    It is atmosphere, not a record of a real conversation.
 *  • Timestamps are null unless a time can actually be verified. A
 *    null timestamp renders as TIME UNDISCLOSED — never invented.
 *  • Redaction reveals are harmless invented strings. Never put real
 *    credentials, keys, personal data or private information here.
 *  • Timeline entries use only verifiable milestones; `date: null`
 *    renders DATE UNDISCLOSED.
 */
import type { MissionId } from './missions'

/* ── ENCRYPTED TRANSMISSIONS ───────────────────────────────────── */

export type Transmission = {
  id: string
  channel: string
  /** Fictional sender label — never a real person's private message. */
  origin: string
  /** Verified/fictional timestamp, or null → "TIME UNDISCLOSED". */
  time: string | null
  subject: string
  body: string[]
  /** Mission this transmission relates to, when it relates to one. */
  missionId: MissionId | null
  encrypted: boolean
}

export const transmissions: Transmission[] = [
  {
    id: 'tx-01',
    channel: 'GHOST PROTOCOL — SECURE CHANNEL',
    origin: 'NODE 03 // COMMAND',
    time: null,
    subject: 'SECURE CHANNEL ESTABLISHED',
    body: [
      'Handshake accepted on a sealed relay. All six operative records are present on this channel.',
      'Standing order remains unchanged: confirm participation before it is written to an archive.',
    ],
    missionId: null,
    encrypted: true,
  },
  {
    id: 'tx-02',
    channel: 'OPERATIONS — LIVE FEED',
    origin: 'NODE 03 // COMMAND',
    time: null,
    subject: 'SECLEAF 2026 — OPERATION STATUS: ACTIVE',
    body: [
      'Operation remains open. All six operatives are assigned to this record.',
      'Debrief fields stay sealed until the unit clears them for release.',
    ],
    missionId: 'secleaf-2026',
    encrypted: true,
  },
  {
    id: 'tx-03',
    channel: 'PERSONNEL — RESTRICTED',
    origin: 'NODE 01 // PERSONNEL',
    time: null,
    subject: 'PERSONNEL CHANNEL — ENCRYPTION ENABLED',
    body: [
      'Six personnel records are held under protocol clearance. Personal channels remain sealed.',
      'No contact detail is published on this channel without explicit release.',
    ],
    missionId: null,
    encrypted: true,
  },
  {
    id: 'tx-04',
    channel: 'FIELD RELAY — BLACKOUT',
    origin: 'NODE 03 // GHOST',
    time: null,
    subject: 'SOLO ASSIGNMENT CONFIRMED — BLACKOUT',
    body: [
      'Operation Blackout is a single-operative assignment. No second operative is attached to this record.',
      'Signal remains open. Access: classified.',
    ],
    missionId: 'blackout',
    encrypted: true,
  },
  {
    id: 'tx-05',
    channel: 'ARCHIVE — SEALED',
    origin: 'NODE 02 // ARCHIVE',
    time: null,
    subject: 'TRANSMISSION RECEIVED',
    body: [
      'Two operations are archived as complete. Two remain in motion.',
      'Archive integrity check passed. No unverified entry was admitted.',
    ],
    missionId: null,
    encrypted: true,
  },
]

export const transmissionCopy = {
  heading: ['ENCRYPTED', 'TRANSMISSIONS.'],
  label: 'COMMUNICATIONS INTERCEPT',
  support: 'A simulated secure channel. Every message below is fictional atmosphere for this site.',
  opening: 'GHOST PROTOCOL — SECURE CHANNEL ESTABLISHED',
  closing: 'END OF TRANSMISSION',
  expand: 'DECRYPT MESSAGE',
  collapse: 'SEAL MESSAGE',
  timeUnknown: 'TIME UNDISCLOSED',
  fictionalNotice:
    'SIMULATED CONTENT // These transmissions are fictional interface copy written for this website. They are not intercepted messages and are not attributed to any real communication.',
}

/* ── REDACTED INTELLIGENCE FILES ───────────────────────────────── */

export type Redaction = {
  /** Position within the document body, in reading order. */
  id: string
  /** What the bar hides. Harmless invented text. */
  reveal: string
  /** Width of the bar as a percentage of the line. */
  width: number
}

export type IntelligenceFile = {
  id: string
  reference: string
  title: string
  classification: string
  clearance: string
  status: string
  issued: string | null
  summary: string
  redactions: Redaction[]
}

export const intelligenceFiles: IntelligenceFile[] = [
  {
    id: 'if-01',
    reference: 'GP-INT-001',
    title: 'CLASSIFIED PERSONNEL RECORD',
    classification: 'OPERATIONAL INTELLIGENCE',
    clearance: 'CLEARANCE LEVEL: RESTRICTED',
    status: 'FILE STATUS: PARTIALLY REDACTED',
    issued: null,
    summary:
      'A personnel summary held at restricted clearance. Six records are indexed; identifying details remain sealed inside the protocol.',
    redactions: [
      { id: 'if-01-a', reveal: 'RECORD SEALED — NO IDENTIFYING DETAIL ON FILE', width: 62 },
      { id: 'if-01-b', reveal: 'OPERATING UNDER CODENAME ONLY', width: 44 },
      { id: 'if-01-c', reveal: 'CLEARANCE VERIFIED // NODE 03', width: 55 },
    ],
  },
  {
    id: 'if-02',
    reference: 'GP-INT-002',
    title: 'OPERATIONAL INTELLIGENCE BRIEF',
    classification: 'FIELD ASSESSMENT',
    clearance: 'CLEARANCE LEVEL: RESTRICTED',
    status: 'FILE STATUS: PARTIALLY REDACTED',
    issued: null,
    summary:
      'A standing brief circulated to the unit. Scope, objectives and results are withheld until the operation closes.',
    redactions: [
      { id: 'if-02-a', reveal: 'OBJECTIVE WITHHELD — AWAITING RELEASE', width: 70 },
      { id: 'if-02-b', reveal: 'NO FIELD RESULT RECORDED', width: 48 },
      { id: 'if-02-c', reveal: 'REVIEW PENDING', width: 34 },
    ],
  },
  {
    id: 'if-03',
    reference: 'GP-INT-003',
    title: 'ASSET & INFRASTRUCTURE INDEX',
    classification: 'SYSTEM INVENTORY',
    clearance: 'CLEARANCE LEVEL: RESTRICTED',
    status: 'FILE STATUS: PARTIALLY REDACTED',
    issued: null,
    summary:
      'An index of tooling referenced elsewhere on this site. No live system, host or credential is described in this file.',
    redactions: [
      { id: 'if-03-a', reveal: 'INVENTORY REDACTED — SEE TECHNICAL ARSENAL', width: 58 },
      { id: 'if-03-b', reveal: 'NO HOST, KEY OR CREDENTIAL IS HELD IN THIS RECORD', width: 74 },
    ],
  },
]

export const redactionCopy = {
  heading: ['REDACTED', 'INTELLIGENCE.'],
  label: 'DECLASSIFICATION DESK',
  support:
    'Fictional documents written for this site. Click a redaction bar to reveal the placeholder underneath.',
  revealAll: 'REVEAL ALL',
  resealAll: 'RE-SEAL FILE',
  sealed: 'REDACTED',
  notice:
    'SIMULATED DOCUMENTS // No real credentials, personal information, keys or live system data appear in these files. Everything revealed is invented interface copy.',
}

/* ── PROTOCOL TIMELINE ─────────────────────────────────────────── */

export type TimelineEntry = {
  id: string
  /** null → DATE UNDISCLOSED. Never invent a date to fill the gap. */
  date: string | null
  label: string
  title: string
  detail: string | null
  missionId: MissionId | null
}

export const timeline: TimelineEntry[] = [
  {
    id: 'tl-protocol',
    date: null,
    label: 'PROTOCOL INITIALISED',
    title: 'GHOST PROTOCOL FOUNDED',
    detail: 'The collective is formed and appoints its lead operator. No founding date is on public record.',
    missionId: null,
  },
  {
    id: 'tl-zerosecure',
    date: null,
    label: 'OPERATION CLOSED',
    title: 'OPERATION ZEROSECURE 2.0',
    detail: 'Archived as complete with three confirmed participants: GHOST, SHADOW and PHANTOM.',
    missionId: 'zerosecure-2',
  },
  {
    id: 'tl-ekathon',
    date: null,
    label: 'OPERATION CLOSED',
    title: 'OPERATION CYBER EKATHON',
    detail: 'Archived as complete with three confirmed participants: GHOST, SHADOW and SPECTRE.',
    missionId: 'cyber-ekathon',
  },
  {
    id: 'tl-blackout',
    date: null,
    label: 'SOLO ASSIGNMENT',
    title: 'OPERATION BLACKOUT',
    detail: 'Opened as a single-operator assignment held exclusively by GHOST. Operation is ongoing.',
    missionId: 'blackout',
  },
  {
    id: 'tl-secleaf',
    date: null,
    label: 'OPERATION LIVE',
    title: 'SECLEAF 2026',
    detail: 'Opened with all six operatives assigned. Operation is ongoing; debrief not yet available.',
    missionId: 'secleaf-2026',
  },
]

export const timelineCopy = {
  heading: ['THE PROTOCOL', 'OVER TIME.'],
  label: 'PROTOCOL TIMELINE',
  support: 'Milestones only. Where no date is verifiable, the record says so rather than guessing.',
  undated: 'DATE UNDISCLOSED',
  open: 'VIEW DETAIL',
  close: 'COLLAPSE',
}

/* ── SYSTEM STATUS ─────────────────────────────────────────────── */

export const systemCopy = {
  heading: 'SYSTEM STATUS',
  online: 'ONLINE',
  /**
   * Presentation label only. This site is a static build with no backend,
   * no monitoring and no telemetry — the panel says so in its footnote.
   */
  notice:
    'DISPLAY LABEL ONLY // This site is a static build. The panel reports the content model, not live infrastructure, and performs no monitoring.',
  labels: {
    operatives: 'PERSONNEL RECORDS',
    active: 'ACTIVE OPERATIONS',
    archived: 'ARCHIVED OPERATIONS',
    missions: 'OPERATION RECORDS',
    assignments: 'CONFIRMED ASSIGNMENTS',
  },
}
