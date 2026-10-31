import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'

/**
 * Fine-pointer only custom cursor: a precise neon dot plus a lagging
 * ring that reacts to links, buttons and text fields. Renders
 * nothing at all on touch devices or with reduced motion.
 */
export function CustomCursor() {
  const reduce = useReducedMotion()
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)
  const [mode, setMode] = useState<'default' | 'hover' | 'text'>('default')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (reduce) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    setEnabled(true)
    document.body.classList.add('cursor-ready')
    return () => document.body.classList.remove('cursor-ready')
  }, [reduce])

  useEffect(() => {
    if (!enabled) return
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let mx = window.innerWidth / 2
    let my = window.innerHeight / 2
    let rx = mx
    let ry = my
    let raf = 0

    const onMove = (event: PointerEvent) => {
      mx = event.clientX
      my = event.clientY
      if (!visible) setVisible(true)
      const target = event.target as HTMLElement | null
      const interactive = target?.closest(
        'a, button, [role="button"], input, textarea, select, [data-cursor="hover"]',
      )
      if (interactive) {
        const isField = interactive.matches('input, textarea')
        setMode(isField ? 'text' : 'hover')
      } else {
        setMode('default')
      }
    }

    const onLeave = () => setVisible(false)
    const onDown = () => ring.dataset.pressed = 'true'
    const onUp = () => ring.dataset.pressed = 'false'

    const loop = () => {
      raf = requestAnimationFrame(loop)
      rx += (mx - rx) * 0.16
      ry += (my - ry) * 0.16
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) scale(${
        ring.dataset.pressed === 'true' ? 0.82 : 1
      })`
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [enabled, visible])

  if (!enabled) return null

  return (
    <div aria-hidden="true" style={{ opacity: visible ? 1 : 0, transition: 'opacity .3s ease' }}>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" data-hover={mode !== 'default' ? mode : 'false'} />
    </div>
  )
}
