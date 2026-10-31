import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

import { cn } from '../lib/utils'

/**
 * Ambient HUD label that briefly re-scrambles a few characters — used
 * sparingly (one or two per section) so it reads as live telemetry
 * rather than noise.
 */
export function DecodeLabel({
  value,
  length = 4,
  interval = 4200,
  className,
}: {
  value: string
  length?: number
  interval?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    if (reduce) return
    let inner: number
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return
      const noise = Array.from({ length }, () =>
        '0123456789ABCDEF'[Math.floor(Math.random() * 16)],
      ).join('')
      setDisplay(noise)
      inner = window.setTimeout(() => setDisplay(value), 420)
    }, interval)
    return () => {
      window.clearInterval(id)
      window.clearTimeout(inner)
    }
  }, [interval, length, reduce, value])

  return (
    <span className={cn('tabular-nums', className)} aria-hidden="true">
      {display}
    </span>
  )
}
