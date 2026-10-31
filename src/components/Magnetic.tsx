import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'

import { cn } from '../lib/utils'

type MagneticProps = {
  children: ReactNode
  className?: string
  /** Maximum px offset pulled toward the pointer. */
  strength?: number
}

/**
 * Subtle magnetic attraction for primary CTAs. Pointer-fine only,
 * and disabled entirely for reduced-motion users.
 */
export function Magnetic({ children, className, strength = 10 }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 220, damping: 22, mass: 0.4 })
  const y = useSpring(rawY, { stiffness: 220, damping: 22, mass: 0.4 })

  return (
    <motion.span
      ref={ref}
      className={cn('inline-flex', className)}
      style={reduce ? undefined : { x, y }}
      onPointerMove={(event) => {
        if (reduce || event.pointerType === 'touch') return
        const rect = ref.current?.getBoundingClientRect()
        if (!rect) return
        const relX = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
        const relY = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
        rawX.set(relX * strength)
        rawY.set(relY * strength)
      }}
      onPointerLeave={() => {
        rawX.set(0)
        rawY.set(0)
      }}
    >
      {children}
    </motion.span>
  )
}
