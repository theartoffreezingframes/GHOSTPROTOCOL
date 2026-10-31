import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'
import { MaskedLines } from './MaskedLines'

type SectionHeadingProps = {
  index: string
  label: string
  lines: readonly string[]
  className?: string
  headingClassName?: string
  align?: 'left' | 'center'
  children?: ReactNode
  /** Optional right-hand slot (metadata, notes, buttons). */
  aside?: ReactNode
  /** Applied to the headline so sections can reference it via aria-labelledby. */
  id?: string
}

/**
 * The recurring section masthead: animated technical index, rule,
 * label, then the masked headline. Used by every section so the
 * rhythm of the page stays consistent.
 */
export function SectionHeading({
  index,
  label,
  lines,
  className,
  headingClassName,
  align = 'left',
  children,
  aside,
  id,
}: SectionHeadingProps) {
  const reduce = useReducedMotion()

  return (
    <div className={cn('relative', className)}>
      <motion.div
        className={cn(
          'mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mb-8',
          align === 'center' && 'justify-center',
        )}
        initial={reduce ? false : { opacity: 0, y: reduce ? 0 : 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 'some', margin: '160% 0px 15% 0px' }}
        transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
      >
        <span className="font-tech text-[0.72rem] tracking-[0.28em] text-neon">{index}</span>
        <span className="font-tech text-[0.72rem] tracking-[0.28em] text-mute" aria-hidden="true">
          //
        </span>
        <span className="font-tech text-[0.72rem] tracking-[0.28em] text-mute">{label}</span>
        <motion.span
          className="hidden h-px flex-1 origin-left bg-line sm:block"
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 'some', margin: '160% 0px 15% 0px' }}
          transition={{ duration: 1.2, ease: EASE_OUT_EXPO, delay: 0.15 }}
          aria-hidden="true"
        />
        {aside}
      </motion.div>

      <div className={cn('flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between', className)}>
        <MaskedLines
          id={id}
          lines={lines}
          className={cn(
            'display-section text-bone',
            align === 'center' && 'text-center',
            headingClassName,
          )}
          amount="some"
        />
        {children && (
          <div className={cn('max-w-md', align === 'center' && 'mx-auto text-center')}>{children}</div>
        )}
      </div>
    </div>
  )
}
