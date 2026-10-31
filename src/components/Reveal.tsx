import { motion, useReducedMotion, type Variants } from 'motion/react'
import type { ElementType, ReactNode } from 'react'

import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'

type RevealProps = {
  children: ReactNode
  className?: string
  /** IntersectionObserver amount — 'some' fires as soon as any part shows. */
  delay?: number
  duration?: number
  /** Distance travelled in px. */
  y?: number
  x?: number
  as?: ElementType
  amount?: number | 'some' | 'all'
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
  amount = 'some',
  once = true,
}: RevealProps) {
  const reduce = useReducedMotion()
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div

  // Reduced motion: render final state with no animation at all, so nothing
  // can ever be left invisible behind a scroll trigger.
  if (reduce) return <MotionTag className={cn(className)}>{children}</MotionTag>

  const variants: Variants = {
    hidden: { opacity: 0, y, x },
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
      viewport={{ once, amount, margin: '160% 0px 15% 0px' }}
    >
      {children}
    </MotionTag>
  )
}
