import type { ReactNode } from 'react'

import { cn } from '../lib/utils'

type HudFrameProps = {
  children?: ReactNode
  className?: string
  /** Optional corner coordinate labels. */
  labels?: [string, string] | null
}

/** Thin technical frame with corner brackets — used on media panels. */
export function HudFrame({ children, className, labels }: HudFrameProps) {
  return (
    <div className={cn('bracket pointer-events-none absolute inset-0 z-20', className)} aria-hidden="true">
      {labels && (
        <>
          <span className="font-tech absolute -top-5 left-0 text-[0.7rem] tracking-[0.24em] text-mute/70">
            {labels[0]}
          </span>
          <span className="font-tech absolute -bottom-5 right-0 text-[0.7rem] tracking-[0.24em] text-mute/70">
            {labels[1]}
          </span>
        </>
      )}
      {children}
    </div>
  )
}
