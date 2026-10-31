import { motion, useReducedMotion, type Variants } from 'motion/react'
import type { ElementType } from 'react'

import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'

type MaskedLinesProps = {
  lines: readonly string[]
  className?: string
  lineClassName?: string
  as?: ElementType
  delay?: number
  stagger?: number
  /** Start the animation immediately instead of on scroll. */
  immediate?: boolean
  amount?: number
  id?: string
}

/**
 * Headline reveal: each line slides up from behind its own clipping
 * mask, one after another — the signature Ghost Protocol type motion.
 *
 * NOTE: the scroll observer lives on the *unclipped* wrapper, never on
 * the translated line itself. An element pushed outside an
 * `overflow:hidden` parent reports zero intersection with
 * IntersectionObserver, which would stall the animation forever.
 */
export function MaskedLines({
  lines,
  className,
  lineClassName,
  as = 'h2',
  delay = 0,
  stagger = 0.09,
  immediate = false,
  amount = 0.3,
  id,
}: MaskedLinesProps) {
  const reduce = useReducedMotion()
  const Tag = as

  const lineVariants = (index: number): Variants => ({
    hidden: reduce ? { opacity: 0 } : { y: '112%', opacity: 0 },
    show: {
      y: '0%',
      opacity: 1,
      transition: {
        duration: reduce ? 0.35 : 1.05,
        ease: EASE_OUT_EXPO,
        delay: delay + index * stagger,
      },
    },
  })

  return (
    <Tag className={cn(className)} id={id}>
      <span className="sr-only">{lines.join(' ')}</span>
      <motion.span
        aria-hidden="true"
        className="block"
        initial="hidden"
        {...(immediate
          ? { animate: 'show' }
          : { whileInView: 'show', viewport: { once: true, amount } })}
      >
        {lines.map((line, i) => (
          <span key={line} className="block overflow-hidden pb-[0.12em]">
            <motion.span
              className={cn('block will-change-transform', lineClassName)}
              variants={lineVariants(i)}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  )
}
