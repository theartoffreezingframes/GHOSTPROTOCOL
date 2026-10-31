/**
 * ═══════════════════════════════════════════════════════════════
 * GHOST PROTOCOL // SECTION TRANSITIONS
 * ═══════════════════════════════════════════════════════════════
 * A short interface handshake shown while the page moves between
 * sections. This is a *visual* layer only:
 *
 *  • it never delays navigation — the scroll starts on the next frame,
 *    not when the animation ends;
 *  • there is no full-screen loading state, just a scan line, a status
 *    line and a brief tone shift;
 *  • the overlay is pointer-events:none, so nothing is ever blocked;
 *  • reduced motion skips it entirely.
 *
 * Messages are presentation copy. Nothing here reports a real system
 * state.
 */

export type SectionTransition = {
  /** Terminal line shown during the handshake. */
  message: string
  /** Optional secondary label. */
  detail: string
}

/**
 * Sections the palette offers that are not nav entries. Kept here so a
 * command can never fall through to the generic fallback copy.
 */
const EXTRA: Record<string, SectionTransition> = {
  status: { message: 'READING SYSTEM STATUS...', detail: 'CONTENT MODEL' },
}

const COPY: Record<string, SectionTransition> = {
  top: { message: 'SWITCHING INTERFACE...', detail: 'RETURNING TO COMMAND' },
  protocol: { message: 'OPENING PROTOCOL...', detail: 'SITE BRIEF' },
  operatives: { message: 'LOADING PERSONNEL DATABASE...', detail: 'SIX RECORDS' },
  network: { message: 'TRACING NETWORK...', detail: 'PARTICIPATION MAP' },
  missions: { message: 'ACCESSING ARCHIVE...', detail: 'CLASSIFIED OPERATIONS' },
  transmissions: { message: 'ESTABLISHING SECURE CHANNEL...', detail: 'ENCRYPTED FEED' },
  lab: { message: 'OPENING ENGINEERING LAB...', detail: 'PROJECT BAYS' },
  arsenal: { message: 'ACCESSING TECHNICAL ARSENAL...', detail: 'TOOL INDEX' },
  radar: { message: 'CALIBRATING RADAR...', detail: 'SIMULATION ONLY' },
  timeline: { message: 'LOADING PROTOCOL TIMELINE...', detail: 'MILESTONE LOG' },
  record: { message: 'OPENING OPERATION RECORD...', detail: 'VERIFIED ENTRIES' },
  intel: { message: 'UNSEALING INTELLIGENCE...', detail: 'REDACTED FILES' },
  status: { message: 'READING SYSTEM STATUS...', detail: 'CONTENT MODEL' },
  contact: { message: 'ESTABLISHING SECURE CHANNEL...', detail: 'CONNECTION REQUEST' },
}

const FALLBACK: SectionTransition = {
  message: 'SWITCHING INTERFACE...',
  detail: 'CLASSIFIED SECTION',
}

export function transitionFor(id: string): SectionTransition {
  return COPY[id] ?? EXTRA[id] ?? FALLBACK
}

/** How long the handshake stays on screen, in ms. Longer than a frame,
 *  far shorter than anything a visitor would register as waiting. */
export const TRANSITION_MS = 620
