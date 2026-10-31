import { motion, useReducedMotion, type Variants } from 'motion/react'
import type { ElementType, ReactNode } from 'react'

import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'

type RevealProps = {
  children: ReactNode
  className?: string
  /** Seconds of delay. */
  delay?: number
  duration?: number
  /** Distance travelled in px. */
  y?: number
  x?: number
  as?: ElementType
  amount?: number
  once?: boolean
}

/**
 * Scroll-triggered reveal: opacity + short translation, one shot,
 * automatically neutralised when the visitor prefers reduced motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.9,
  y = 28,
  x = 0,
  as = 'div',
  amount = 0.25,
  once = true,
}: RevealProps) {
  const reduce = useReducedMotion()
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div

  const variants: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y, x },
    show: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration, ease: EASE_OUT_EXPO, delay },
    },
  }

  return (
    <MotionTag
      className={cn(className)}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount, margin: '0px 0px -8% 0px' }}
    >
      {children}
    </MotionTag>
  )
}
