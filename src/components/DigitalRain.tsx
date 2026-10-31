import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

type DigitalRainProps = {
  className?: string
  /** Lower = sparser. Recommended 0.6–1 on desktop, 0.4 on mobile. */
  density?: number
  opacity?: number
  /** Glyph palette: katakana + latin hex, the classic ghost-in-the-wire look. */
  charset?: string
  speed?: number
}

const DEFAULT_CHARS =
  'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎ0123456789ABCDEF'

/**
 * Canvas digital rain. Deliberately low-cost:
 *  • one canvas, capped device pixel ratio
 *  • ~24 fps instead of 60
 *  • pauses when off-screen or when the tab is hidden
 *  • renders a single static frame for reduced-motion visitors
 */
export function DigitalRain({
  className,
  density = 1,
  opacity = 0.5,
  charset = DEFAULT_CHARS,
  speed = 1,
}: DigitalRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const parent = canvas.parentElement
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
    const fontSize = 14
    let columns = 0
    let drops: number[] = []
    let speeds: number[] = []
    let width = 0
    let height = 0
    let raf = 0
    let last = 0
    let visible = true
    let inView = true

    const resize = () => {
      const rect = parent?.getBoundingClientRect()
      width = Math.max(1, Math.floor(rect?.width ?? window.innerWidth))
      height = Math.max(1, Math.floor(rect?.height ?? window.innerHeight))
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      columns = Math.max(8, Math.floor((width / fontSize) * 0.92 * density) + 4)
      drops = Array.from({ length: columns }, () => Math.random() * (height / fontSize))
      speeds = Array.from({ length: columns }, () => 0.35 + Math.random() * 0.85 * speed)
      ctx.font = `500 ${fontSize}px 'JetBrains Mono', monospace`
      ctx.textBaseline = 'top'
    }

    const draw = (dt: number) => {
      // Trail fade — the signature falling-light smear.
      ctx.fillStyle = 'rgba(5, 7, 6, 0.11)'
      ctx.fillRect(0, 0, width, height)

      const step = Math.min(dt / 16.667, 3)
      for (let i = 0; i < columns; i += 1) {
        const col = i * (width / columns)
        const row = drops[i] * fontSize
        const char = charset[Math.floor(Math.random() * charset.length)]

        // Head glyph is bright, the tail is dimmer.
        ctx.fillStyle = Math.random() > 0.94 ? 'rgba(200, 255, 185, 0.95)' : 'rgba(57, 255, 20, 0.62)'
        ctx.fillText(char, col, row)

        drops[i] += speeds[i] * step * 0.55
        if (row > height && Math.random() > 0.975) {
          drops[i] = -Math.random() * 12
        }
      }
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (!visible || !inView) return
      if (now - last < 42) return // ~24fps cap
      const dt = last ? now - last : 16
      last = now
      draw(dt)
    }

    resize()
    ctx.fillStyle = 'rgba(5, 7, 6, 1)'
    ctx.fillRect(0, 0, width, height)

    if (reduce) {
      // Static single frame — still atmospheric, zero motion.
      for (let i = 0; i < columns; i += 1) {
        const col = i * (width / columns)
        for (let k = 0; k < 6; k += 1) {
          const char = charset[Math.floor(Math.random() * charset.length)]
          ctx.fillStyle = `rgba(57, 255, 20, ${0.36 - k * 0.05})`
          ctx.fillText(char, col, drops[i] * fontSize - k * fontSize)
        }
      }
    } else {
      raf = requestAnimationFrame(loop)
    }

    const onVisibility = () => {
      visible = document.visibilityState === 'visible'
    }
    document.addEventListener('visibilitychange', onVisibility)

    const observer = new ResizeObserver(resize)
    if (parent) observer.observe(parent)

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
    })
    io.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisibility)
      observer.disconnect()
      io.disconnect()
    }
  }, [charset, density, reduce, speed])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ opacity }}
    />
  )
}
