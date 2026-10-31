import { useEffect, useId, useState } from 'react'
import { useReducedMotion } from 'motion/react'

import { cn } from '../lib/utils'

type GlitchTextProps = {
  children: string
  className?: string
  /** When true the layers glitch at full speed. */
  active?: boolean
  /** Continuously glitch on a slow ambient cycle. */
  ambient?: boolean
  as?: 'span' | 'div'
}

/**
 * RGB-split glitch typography. Two pseudo layers are driven by CSS
 * keyframes (cheap, compositor friendly). The visible text stays
 * readable; glitch layers are decorative and aria-hidden.
 */
export function GlitchText({
  children,
  className,
  active = false,
  ambient = true,
  as = 'span',
}: GlitchTextProps) {
  const reduce = useReducedMotion()
  const id = useId()
  const Tag = as
  const [burst, setBurst] = useState(false)

  // Occasional short bursts rather than permanent movement.
  useEffect(() => {
    if (!ambient || reduce) return
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      timer = setTimeout(
        () => {
          setBurst(true)
          setTimeout(() => setBurst(false), 420)
          schedule()
        },
        4200 + Math.random() * 5200,
      )
    }
    schedule()
    return () => clearTimeout(timer)
  }, [ambient, reduce])

  return (
    <Tag
      className={cn('glitch-text', className)}
      data-active={active || burst ? 'true' : 'false'}
      data-glitch-id={id}
    >
      <span aria-hidden="true" className="glitch-layer">
        {children}
      </span>
      <span aria-hidden="true" className="glitch-layer">
        {children}
      </span>
      <span className="relative z-10">{children}</span>
    </Tag>
  )
}
