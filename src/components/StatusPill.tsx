import type { ReactNode } from 'react'

import { cn } from '../lib/utils'

type StatusPillProps = {
  children: ReactNode
  tone?: 'online' | 'complete' | 'alert' | 'muted'
  className?: string
  /** Gentle looping dot animation. */
  pulse?: boolean
}

const tones = {
  online: 'border-neon/35 text-neon bg-neon/[0.06]',
  complete: 'border-emerald/35 text-emerald bg-emerald/[0.06]',
  alert: 'border-neon/50 text-neon bg-neon/[0.08]',
  muted: 'border-line text-mute bg-white/[0.015]',
} as const

const dots = {
  online: 'bg-neon',
  complete: 'bg-emerald',
  alert: 'bg-neon',
  muted: 'bg-mute/60',
} as const

export function StatusPill({ children, tone = 'muted', className, pulse = false }: StatusPillProps) {
  return (
    <span
      className={cn(
        'font-tech inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[0.7rem] leading-none tracking-[0.18em]',
        tones[tone],
        className,
      )}
    >
      <span
        className={cn('h-1 w-1 shrink-0 rounded-full', dots[tone], pulse && 'animate-pulse-dot')}
        aria-hidden="true"
      />
      {children}
    </span>
  )
}
