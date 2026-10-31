import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'motion/react'

import { cn } from '../lib/utils'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>#*+=×%$'

type ScrambleTextProps = {
  text: string
  className?: string
  /** ms between frames while decoding. */
  speed?: number
  /** Delay before decoding starts. */
  delay?: number
  /** Characters kept locked at the start (useful for prefixes). */
  lockStart?: number
  as?: 'span' | 'div' | 'p'
}

/**
 * Decodes text character-by-character once it scrolls into view.
 * Falls back to the final string for reduced-motion users and for
 * screen readers (the scrambled frames are aria-hidden).
 */
export function ScrambleText({
  text,
  className,
  speed = 26,
  delay = 0,
  lockStart = 0,
  as = 'span',
}: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(reduce ? text : '')
  const [done, setDone] = useState(Boolean(reduce))

  useEffect(() => {
    if (reduce || !inView) return
    let frame = 0
    let raf = 0
    let start = 0
    let cancelled = false

    const totalFrames = text.length + 14

    const tick = (now: number) => {
      if (cancelled) return
      if (!start) start = now
      const elapsed = now - start
      if (elapsed < delay) {
        raf = requestAnimationFrame(tick)
        return
      }
      if (now - start - delay > frame * speed) {
        frame += 1
        const revealed = Math.max(0, frame - 6)
        const next = text
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' '
            if (i < lockStart) return char
            if (i < revealed) return char
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          })
          .join('')
        setDisplay(next)
        if (frame >= totalFrames) {
          setDisplay(text)
          setDone(true)
          return
        }
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [inView, reduce, text, speed, delay, lockStart])

  const Tag = as

  return (
    <Tag ref={ref as never} className={cn('inline-block', className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={cn(!done && 'tabular-nums')}>
        {display || '\u00A0'}
      </span>
    </Tag>
  )
}
