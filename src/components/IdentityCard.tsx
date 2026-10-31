import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronLeft, ChevronRight, Download, Loader2, ScanLine, X } from 'lucide-react'

import { activeOperatives, type Operative } from '../data/team'
import { imageFallback, imageSrcSet } from '../lib/media'
import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'
import { playSound } from '../lib/audio'

/**
 * DIGITAL OPERATIVE ID CARDS
 * ---------------------------------------------------------------
 * A preview modal plus a real raster download.
 *
 * The download is drawn by us on a <canvas> at 1600×1000 (8:5), from
 * the same data the card renders and the same portrait file the page
 * loads. Nothing is screenshotted, so no backdrop, no page chrome and
 * no CSS blur can leak into the image, and the text is drawn at device
 * resolution rather than being upscaled from a DOM capture.
 *
 * This library would normally be html2canvas or similar; we draw by
 * hand instead because (a) no export dependency exists in the project
 * and the brief asks not to add one unnecessarily, and (b) a canvas
 * gives exact control over clipping and type sharpness.
 *
 * The IDs are display identifiers only. They are not credentials, and
 * the card says so.
 */

const CARD_W = 1600
const CARD_H = 1000

/** Fonts used on the canvas; must be resolved before drawing. */
const CANVAS_FONTS = [
  '500 88px "Space Grotesk"',
  '400 30px "JetBrains Mono"',
  '500 26px "JetBrains Mono"',
  '400 22px "JetBrains Mono"',
  '400 18px "Inter"',
]

const CLEARANCE_NOTE = 'DISPLAY RECORD — NOT A CREDENTIAL'

function displayId(operative: Operative) {
  return `GP-${operative.number}`
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`portrait failed: ${src}`))
    img.src = src
  })
}

/** Deterministic decorative code — same operative, same glyphs, forever. */
function decorationCode(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  const glyphs = '0123456789ABCDEF'
  let out = ''
  for (let i = 0; i < 18; i += 1) {
    hash = (hash * 1103515245 + 12345) >>> 0
    out += glyphs[(hash >>> 16) & 15]
    if (i % 3 === 2 && i !== 17) out += ' '
  }
  return out
}

/**
 * Rounded rectangle with optional per-side control — drawn manually so
 * the export does not depend on roundRect support.
 */
function rounded(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radii: number | [number, number, number, number],
) {
  const [tl, tr, br, bl] = typeof radii === 'number' ? [radii, radii, radii, radii] : radii
  ctx.beginPath()
  ctx.moveTo(x + tl, y)
  ctx.lineTo(x + w - tr, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + tr)
  ctx.lineTo(x + w, y + h - br)
  ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h)
  ctx.lineTo(x + bl, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - bl)
  ctx.lineTo(x, y + tl)
  ctx.quadraticCurveTo(x, y, x + tl, y)
  ctx.closePath()
}

/**
 * Cover-fit an image inside a box, cropping from the top area so the
 * subject's head stays in frame. Returns the transform actually used.
 */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  focusY = 0.42,
) {
  const scale = Math.max(w / img.width, h / img.height)
  const dw = img.width * scale
  const dh = img.height * scale
  const dx = x + (w - dw) / 2
  const dy = y + (h - dh) * focusY
  ctx.drawImage(img, dx, dy, dw, dh)
}

async function renderCard(operative: Operative): Promise<Blob> {
  // Make sure the display faces are ready, otherwise the canvas falls
  // back to a generic sans and the type looks wrong in the export.
  if (document.fonts?.ready) {
    await Promise.all(CANVAS_FONTS.map((font) => document.fonts.load(font).catch(() => null)))
    await document.fonts.ready
  }

  const canvas = document.createElement('canvas')
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas unavailable')

  const id = displayId(operative)

  /* ── background ─────────────────────────────────────────────── */
  const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H)
  bg.addColorStop(0, '#0A130C')
  bg.addColorStop(0.55, '#070B08')
  bg.addColorStop(1, '#050706')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  // corner glow
  const glow = ctx.createRadialGradient(CARD_W * 0.8, 0, 0, CARD_W * 0.8, 0, CARD_W * 0.7)
  glow.addColorStop(0, 'rgba(57,255,20,0.13)')
  glow.addColorStop(1, 'rgba(57,255,20,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  // guilloche grid
  ctx.save()
  ctx.strokeStyle = 'rgba(57,255,20,0.045)'
  ctx.lineWidth = 1
  for (let x = -CARD_H; x < CARD_W; x += 14) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x + CARD_H, CARD_H)
    ctx.stroke()
  }
  ctx.restore()

  /* ── portrait panel ─────────────────────────────────────────── */
  const panel = { x: 72, y: 168, w: 470, h: 588, r: 2 }
  ctx.save()
  rounded(ctx, panel.x, panel.y, panel.w, panel.h, panel.r)
  ctx.clip()
  ctx.fillStyle = '#040604'
  ctx.fillRect(panel.x, panel.y, panel.w, panel.h)
  try {
    const img = await loadImage(imageFallback(operative.image))
    drawCover(ctx, img, panel.x, panel.y, panel.w, panel.h)
  } catch {
    // Portrait missing — the panel stays as a black void rather than
    // failing the whole export.
  }
  // faint green wash + top-down shade for depth
  const wash = ctx.createLinearGradient(0, panel.y, 0, panel.y + panel.h)
  wash.addColorStop(0, 'rgba(5,7,6,0.35)')
  wash.addColorStop(0.5, 'rgba(57,255,20,0.04)')
  wash.addColorStop(1, 'rgba(5,7,6,0.92)')
  ctx.fillStyle = wash
  ctx.fillRect(panel.x, panel.y, panel.w, panel.h)
  ctx.restore()

  // panel border + corner ticks
  ctx.strokeStyle = 'rgba(57,255,20,0.35)'
  ctx.lineWidth = 1
  ctx.strokeRect(panel.x + 0.5, panel.y + 0.5, panel.w - 1, panel.h - 1)
  ctx.strokeStyle = 'rgba(57,255,20,0.85)'
  ctx.lineWidth = 2
  const tick = 26
  const corners: [number, number, number, number][] = [
    [panel.x, panel.y, 1, 1],
    [panel.x + panel.w, panel.y, -1, 1],
    [panel.x, panel.y + panel.h, 1, -1],
    [panel.x + panel.w, panel.y + panel.h, -1, -1],
  ]
  for (const [cx, cy, sx, sy] of corners) {
    ctx.beginPath()
    ctx.moveTo(cx + sx * tick, cy)
    ctx.lineTo(cx, cy)
    ctx.lineTo(cx, cy + sy * tick)
    ctx.stroke()
  }

  // portrait caption strip
  ctx.fillStyle = 'rgba(4,6,4,0.86)'
  ctx.fillRect(panel.x, panel.y + panel.h - 46, panel.w, 46)
  ctx.fillStyle = 'rgba(57,255,20,0.75)'
  ctx.font = '400 16px "JetBrains Mono", monospace'
  ctx.fillText('PORTRAIT // ANONYMOUS BY DESIGN', panel.x + 16, panel.y + panel.h - 18)

  /* ── text block ─────────────────────────────────────────────── */
  const tx = 610
  const right = CARD_W - 72

  // masthead
  ctx.fillStyle = '#39FF14'
  ctx.font = '400 18px "JetBrains Mono", monospace'
  ctx.fillText('GHOST PROTOCOL', 72, 88)

  ctx.fillStyle = 'rgba(145,163,151,0.75)'
  ctx.font = '400 13px "JetBrains Mono", monospace'
  ctx.fillText('INDEPENDENT CYBER COLLECTIVE', 72, 112)

  // top rule
  ctx.strokeStyle = 'rgba(57,255,20,0.22)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(72, 136.5)
  ctx.lineTo(right, 136.5)
  ctx.stroke()

  // document label (right)
  ctx.textAlign = 'right'
  ctx.fillStyle = 'rgba(232,245,233,0.55)'
  ctx.font = '400 13px "JetBrains Mono", monospace'
  ctx.fillText('PERSONNEL IDENTIFICATION RECORD', right, 88)
  ctx.fillStyle = '#39FF14'
  ctx.font = '500 26px "JetBrains Mono", monospace'
  ctx.fillText(id, right, 118)
  ctx.textAlign = 'left'

  // codename
  ctx.fillStyle = '#E8F5E9'
  ctx.font = '500 88px "Space Grotesk", sans-serif'
  ctx.fillText(operative.codename, tx, 236)

  ctx.fillStyle = 'rgba(57,255,20,0.85)'
  ctx.font = '400 17px "JetBrains Mono", monospace'
  ctx.fillText(operative.designation, tx, 268)

  // divider
  ctx.strokeStyle = 'rgba(145,163,151,0.18)'
  ctx.beginPath()
  ctx.moveTo(tx, 298.5)
  ctx.lineTo(right, 298.5)
  ctx.stroke()

  // field rows
  const fields: [string, string][] = [
    ['FULL NAME', operative.fullName],
    ['DESIGNATION', operative.designation],
    ['ROLE', operative.role],
    ['OPERATIVE NO.', operative.number],
    ['STATUS', 'ACTIVE — CLASSIFIED RECORD'],
  ]
  let fy = 344
  for (const [label, value] of fields) {
    ctx.fillStyle = 'rgba(145,163,151,0.6)'
    ctx.font = '400 13px "JetBrains Mono", monospace'
    ctx.fillText(label, tx, fy)

    ctx.fillStyle = '#E8F5E9'
    const size = value.length > 26 ? 24 : value.length > 18 ? 27 : 30
    ctx.font = `400 ${size}px "JetBrains Mono", monospace`
    ctx.fillText(value, tx, fy + 26)
    fy += 74
  }

  // decorative code + rule
  ctx.strokeStyle = 'rgba(145,163,151,0.18)'
  ctx.beginPath()
  ctx.moveTo(tx, fy - 18.5)
  ctx.lineTo(right, fy - 18.5)
  ctx.stroke()

  ctx.fillStyle = 'rgba(57,255,20,0.5)'
  ctx.font = '400 13px "JetBrains Mono", monospace'
  ctx.fillText(decorationCode(operative.codename), tx, fy + 18)

  /* ── decorative security block (right of the fields) ────────── */
  const bx = 1310
  const by = 344
  const bs = 132
  ctx.strokeStyle = 'rgba(57,255,20,0.28)'
  ctx.strokeRect(bx + 0.5, by + 0.5, bs, bs)
  // deterministic pseudo-QR: decorative only, encodes nothing
  let seed = 0
  for (let i = 0; i < operative.codename.length; i += 1) seed = (seed * 31 + operative.codename.charCodeAt(i)) >>> 0
  const grid = 9
  const cell = (bs - 16) / grid
  for (let gy = 0; gy < grid; gy += 1) {
    for (let gx = 0; gx < grid; gx += 1) {
      seed = (seed * 1103515245 + 12345) >>> 0
      if ((seed >>> 20) & 1) {
        ctx.fillStyle = 'rgba(57,255,20,0.5)'
        ctx.fillRect(bx + 8 + gx * cell, by + 8 + gy * cell, cell - 1.5, cell - 1.5)
      }
    }
  }
  // finder corners so it reads as a code without impersonating one
  ctx.fillStyle = 'rgba(57,255,20,0.85)'
  const cornerBox = (cx: number, cy: number) => {
    ctx.fillRect(cx, cy, cell * 2, 2)
    ctx.fillRect(cx, cy, 2, cell * 2)
  }
  cornerBox(bx + 8, by + 8)
  cornerBox(bx + bs - 8 - cell * 2, by + 8)
  cornerBox(bx + 8, by + bs - 10)

  ctx.fillStyle = 'rgba(145,163,151,0.5)'
  ctx.font = '400 10px "JetBrains Mono", monospace'
  ctx.fillText('DECORATIVE MARK', bx, by + bs + 18)

  /* ── footer ─────────────────────────────────────────────────── */
  ctx.strokeStyle = 'rgba(57,255,20,0.22)'
  ctx.beginPath()
  ctx.moveTo(72, 858.5)
  ctx.lineTo(right, 858.5)
  ctx.stroke()

  ctx.fillStyle = 'rgba(232,245,233,0.62)'
  ctx.font = '400 15px "Inter", sans-serif'
  ctx.fillText(
    'FICTIONAL PERSONNEL RECORD WRITTEN FOR THIS WEBSITE. THIS IS A DISPLAY IDENTIFIER,',
    72,
    894,
  )
  ctx.fillText('NOT A REAL CREDENTIAL, CLEARANCE, CERTIFICATION OR ACCESS PERMISSION.', 72, 918)

  ctx.fillStyle = 'rgba(57,255,20,0.7)'
  ctx.font = '400 13px "JetBrains Mono", monospace'
  ctx.fillText(`${CLEARANCE_NOTE} // GHOSTPROTOCOL`, 72, 958)

  ctx.textAlign = 'right'
  ctx.fillStyle = 'rgba(145,163,151,0.5)'
  ctx.fillText(decorationCode(id).replace(/\s/g, '').slice(0, 12), right, 958)
  ctx.textAlign = 'left'

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('export failed'))
    }, 'image/png')
  })
}

export function IdentityCards() {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const reduce = useReducedMotion()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const restoreTo = useRef<HTMLElement | null>(null)

  const operative = activeOperatives[index]
  const total = activeOperatives.length

  const openAt = useCallback((position: number) => {
    restoreTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setIndex(position)
    setStatus('idle')
    setError(null)
    setOpen(true)
    playSound('dossier')
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    const target = restoreTo.current
    if (target?.isConnected) window.setTimeout(() => target.focus({ preventScroll: true }), 0)
  }, [])

  const step = useCallback(
    (direction: number) => {
      setIndex((current) => (current + direction + total) % total)
      setStatus('idle')
      setError(null)
    },
    [total],
  )

  // Modal keyboard contract: Escape closes, arrows change card, focus is trapped.
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus())

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        step(1)
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        step(-1)
        return
      }
      if (event.key === 'Tab') {
        const root = dialogRef.current
        if (!root) return
        const focusables = Array.from(
          root.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((node) => node.offsetParent !== null)
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKey)
    document.body.classList.add('is-locked')
    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('is-locked')
      previous?.focus?.({ preventScroll: true })
    }
  }, [open, close, step])

  const download = useCallback(async () => {
    setStatus('working')
    setError(null)
    try {
      const blob = await renderCard(operative)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ghost-protocol-${operative.codename.toLowerCase()}-${displayId(operative)}.png`
      document.body.appendChild(link)
      link.click()
      link.remove()
      // Give the browser a beat to start the download before revoking.
      window.setTimeout(() => URL.revokeObjectURL(url), 4000)
      setStatus('done')
      playSound('confirm')
    } catch (cause) {
      setStatus('error')
      setError(cause instanceof Error ? cause.message : 'export failed')
    }
  }, [operative])

  const decoration = useMemo(() => decorationCode(operative.codename), [operative.codename])

  return (
    <section
      id="identity"
      aria-labelledby="identity-heading"
      className="relative overflow-hidden border-t border-line-soft bg-void py-24 sm:py-32 lg:py-40"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 grid-bg opacity-25" />
        <div className="absolute left-1/2 top-1/3 h-[28rem] w-[min(60rem,92vw)] -translate-x-1/2 rounded-[100%] bg-emerald/[0.04] blur-[130px]" />
      </div>

      <div className="container-x relative z-10">
        <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mb-8">
          <span className="font-tech text-[0.72rem] tracking-[0.28em] text-neon">07</span>
          <span className="font-tech text-[0.72rem] tracking-[0.28em] text-mute" aria-hidden="true">
            //
          </span>
          <span className="font-tech text-[0.72rem] tracking-[0.28em] text-mute">
            PERSONNEL IDENTIFICATION
          </span>
          <span className="hidden h-px flex-1 bg-line sm:block" aria-hidden="true" />
          <span className="font-tech text-[0.62rem] tracking-[0.22em] text-mute/60">
            06 CARDS // PNG EXPORT
          </span>
        </div>

        <h2
          id="identity-heading"
          className="display-section font-display max-w-4xl uppercase text-bone"
        >
          SIX FILES.
          <br />
          ONE PROTOCOL.
        </h2>

        <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-mute">
          Each operative carries a personnel card. Preview one, switch between records, and
          download a 1600 × 1000 PNG rendered from the same data the dossier uses.
        </p>

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {activeOperatives.map((record, position) => (
            <li key={record.number}>
              <button
                type="button"
                onClick={() => openAt(position)}
                data-operative-card={record.codename}
                className="group relative flex w-full items-center gap-3 border border-line-soft bg-card/40 p-3 text-left transition-colors duration-300 hover:border-neon/40 focus-visible:border-neon"
              >
                <span className="relative block h-16 w-[3.25rem] shrink-0 overflow-hidden border border-line-soft">
                  <img
                    src={imageFallback(record.image)}
                    srcSet={imageSrcSet(record.image)}
                    sizes="52px"
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    width={52}
                    height={64}
                    className="h-full w-full object-cover object-top grayscale-[35%] transition-transform duration-500 group-hover:scale-105"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-tech block text-[0.5rem] tracking-[0.2em] text-neon/70">
                    GP-{record.number}
                  </span>
                  <span className="font-display mt-1 block truncate text-[1.05rem] uppercase leading-none text-bone">
                    {record.codename}
                  </span>
                  <span className="mt-1.5 block truncate text-[0.62rem] tracking-[0.1em] text-mute/60">
                    {record.role}
                  </span>
                </span>
                <ScanLine size={13} aria-hidden="true" className="shrink-0 text-mute/40 transition-colors group-hover:text-neon" />
                <span className="sr-only">Preview identification card for {record.codename}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[250] flex items-center justify-center overflow-y-auto p-4 py-8"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-void/85 backdrop-blur-[6px]" onClick={close} aria-hidden="true" />

            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="id-card-title"
              className="relative my-auto w-full max-w-3xl"
              initial={reduce ? false : { opacity: 0, y: 18, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: reduce ? 0 : 0.3, ease: EASE_OUT_EXPO }}
            >
              <div className="flex items-center justify-between border border-b-0 border-line-soft bg-void/90 px-3 py-2">
                <p id="id-card-title" className="font-tech text-[0.56rem] tracking-[0.24em] text-neon">
                  IDENTIFICATION PREVIEW // {index + 1} OF {total}
                </p>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={close}
                  aria-label="Close identification preview"
                  className="text-mute/60 transition-colors hover:text-neon focus-visible:text-neon"
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </div>

              {/* ── the card itself (mirrors the canvas export) ── */}
              <div className="gp-id-card relative border border-neon/25 p-4 sm:p-6">
                <div className="gp-id-guilloche pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />

                <div className="relative flex items-center justify-between border-b border-neon/20 pb-3">
                  <div>
                    <p className="font-tech text-[0.6rem] tracking-[0.3em] text-neon">GHOST PROTOCOL</p>
                    <p className="font-tech mt-1 text-[0.46rem] tracking-[0.24em] text-mute/60">
                      INDEPENDENT CYBER COLLECTIVE
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-tech text-[0.46rem] tracking-[0.22em] text-bone/50">
                      PERSONNEL IDENTIFICATION
                    </p>
                    <p className="font-tech mt-1 text-[0.82rem] tracking-[0.16em] text-neon">
                      GP-{operative.number}
                    </p>
                  </div>
                </div>

                <div className="relative mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,11.5rem)_1fr] sm:gap-6">
                  <div className="relative aspect-[4/5] overflow-hidden border border-neon/30 bg-black">
                    <img
                      src={imageFallback(operative.image)}
                      srcSet={imageSrcSet(operative.image)}
                      sizes="(max-width: 640px) 90vw, 184px"
                      alt={operative.image.alt}
                      width={184}
                      height={230}
                      className="h-full w-full object-cover object-top"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/35" />
                    <p className="font-tech absolute inset-x-0 bottom-0 border-t border-neon/20 bg-black/70 px-2 py-1 text-[0.4rem] tracking-[0.16em] text-neon/75">
                      PORTRAIT // ANONYMOUS BY DESIGN
                    </p>
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-display text-[clamp(1.9rem,6vw,2.9rem)] uppercase leading-none text-bone">
                      {operative.codename}
                    </h3>
                    <p className="font-tech mt-1.5 text-[0.56rem] tracking-[0.2em] text-neon/85">
                      {operative.designation}
                    </p>

                    <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
                      {[
                        ['FULL NAME', operative.fullName],
                        ['ROLE', operative.role],
                        ['OPERATIVE NO.', operative.number],
                        ['DISPLAY ID', `GP-${operative.number}`],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt className="font-tech text-[0.42rem] tracking-[0.22em] text-mute/50">
                            {label}
                          </dt>
                          <dd className="font-tech mt-0.5 text-[0.68rem] leading-snug tracking-[0.08em] text-bone/90">
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-4 flex items-center gap-2 border border-neon/20 px-2 py-1.5">
                      <span className="h-1 w-1 animate-pulse-dot rounded-full bg-neon" aria-hidden="true" />
                      <span className="font-tech text-[0.44rem] tracking-[0.2em] text-neon/80">
                        STATUS // ACTIVE — CLASSIFIED RECORD
                      </span>
                    </div>

                    <p className="font-tech mt-2 text-[0.44rem] tracking-[0.18em] text-neon/45">
                      {decoration}
                    </p>
                  </div>
                </div>

                <div className="relative mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-neon/20 pt-3">
                  <p className="max-w-md text-[0.52rem] leading-relaxed tracking-[0.06em] text-bone/45">
                    FICTIONAL PERSONNEL RECORD WRITTEN FOR THIS WEBSITE. A DISPLAY IDENTIFIER, NOT
                    A REAL CREDENTIAL, CLEARANCE, CERTIFICATION OR ACCESS PERMISSION.
                  </p>
                  <p className="font-tech text-[0.42rem] tracking-[0.2em] text-mute/40">
                    {CLEARANCE_NOTE}
                  </p>
                </div>
              </div>

              {/* ── controls ── */}
              <div className="flex flex-wrap items-center justify-between gap-3 border border-t-0 border-line-soft bg-void/90 px-3 py-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Previous operative card"
                    className="border border-line-soft p-2 text-mute/70 transition-colors hover:border-neon/50 hover:text-neon"
                  >
                    <ChevronLeft size={13} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Next operative card"
                    className="border border-line-soft p-2 text-mute/70 transition-colors hover:border-neon/50 hover:text-neon"
                  >
                    <ChevronRight size={13} aria-hidden="true" />
                  </button>
                  <div className="ml-1 flex items-center gap-1.5" aria-hidden="true">
                    {activeOperatives.map((record, position) => (
                      <span
                        key={record.number}
                        className={cn(
                          'h-1 w-1 rounded-full transition-colors',
                          position === index ? 'bg-neon' : 'bg-mute/25',
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={download}
                    disabled={status === 'working'}
                    className="font-tech inline-flex items-center gap-2 border border-neon/50 bg-neon/[0.08] px-3 py-2 text-[0.56rem] tracking-[0.2em] text-neon transition-colors hover:bg-neon/[0.14] disabled:opacity-60"
                  >
                    {status === 'working' ? (
                      <Loader2 size={11} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <Download size={11} aria-hidden="true" />
                    )}
                    {status === 'working' ? 'RENDERING PNG…' : 'DOWNLOAD PNG'}
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    className="font-tech border border-line-soft px-3 py-2 text-[0.56rem] tracking-[0.2em] text-mute/70 transition-colors hover:border-neon/40 hover:text-neon"
                  >
                    CLOSE
                  </button>
                </div>
              </div>

              <p className="font-tech mt-2 flex flex-wrap items-center justify-between gap-2 text-[0.46rem] tracking-[0.14em] text-mute/40">
                <span aria-live="polite">
                  {status === 'done'
                    ? 'PNG RENDERED — CHECK YOUR DOWNLOADS'
                    : status === 'error'
                      ? `EXPORT FAILED — ${error ?? 'UNKNOWN ERROR'}`
                      : '1600 × 1000 PNG · PORTRAIT INCLUDED · NO PAGE CHROME'}
                </span>
                <span>← → SWITCH RECORD · ESC CLOSE</span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
