/**
 * GHOST PROTOCOL // CROSS-COMPONENT EVENTS
 * ---------------------------------------------------------------
 * Two tiny custom events let the command palette hand off to sections
 * without prop-drilling through the whole tree or inventing a router.
 * Both are `window` CustomEvents and both are cleaned up by their
 * listener's `useEffect` teardown.
 */

/** Palette asked the archive to scope itself to one mission. */
export const FOCUS_MISSIONS_EVENT = 'gp:focus-mission'

/** Palette asked the identity desk to open a specific card. */
export const OPEN_ID_CARD_EVENT = 'gp:open-id-card'

export type FocusMissionDetail = { missionId: string | null }
export type OpenIdCardDetail = { codename: string }

export function emit(event: string, detail: unknown) {
  window.dispatchEvent(new CustomEvent(event, { detail }))
}
