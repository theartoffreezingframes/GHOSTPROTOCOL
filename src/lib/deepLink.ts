/**
 * GHOST PROTOCOL // DEEP LINKS
 * ---------------------------------------------------------------
 * Small helpers for "take the visitor to exactly this record".
 * Sections opt in by marking their rows with `data-*` attributes;
 * nothing here reaches into component internals.
 */

const HIGHLIGHT_MS = 1900
const HIGHLIGHT_CLASS = 'gp-target-flash'

type ScrollOptions = { offset?: number }

function scrollToNode(node: HTMLElement, reduce: boolean, options: ScrollOptions = {}) {
  const offset = options.offset ?? 90
  const top = node.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
}

/**
 * Scroll to a mission row and flash it so the visitor can see which
 * record a command acted on. Purely presentational — no state changes.
 */
export function focusMission(missionId: string, reduce: boolean) {
  const node = document.querySelector<HTMLElement>(`[data-mission-id="${missionId}"]`)
  if (!node) return
  scrollToNode(node, reduce, { offset: 110 })

  if (reduce) {
    node.setAttribute('tabindex', '-1')
    node.focus({ preventScroll: true })
    return
  }

  node.classList.add(HIGHLIGHT_CLASS)
  window.setTimeout(() => node.classList.remove(HIGHLIGHT_CLASS), HIGHLIGHT_MS)
  node.setAttribute('tabindex', '-1')
  window.setTimeout(() => node.focus({ preventScroll: true }), 420)
}

/** Scroll to an operative card and flash it. */
export function focusOperative(codename: string, reduce: boolean) {
  const node = document.querySelector<HTMLElement>(`[data-operative="${codename}"]`)
  if (!node) return
  scrollToNode(node, reduce, { offset: 96 })
  if (reduce) return
  node.classList.add(HIGHLIGHT_CLASS)
  window.setTimeout(() => node.classList.remove(HIGHLIGHT_CLASS), HIGHLIGHT_MS)
}
