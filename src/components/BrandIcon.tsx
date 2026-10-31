import { siGithub, siInstagram, siX } from 'simple-icons'

import { cn } from '../lib/utils'

/**
 * Brand marks (GitHub / LinkedIn / Instagram / X) are not part of the
 * core lucide set, so their official monochrome paths come from
 * simple-icons and are rendered inline as SVG.
 */
type IconShape = { title: string; path: string }

/** LinkedIn is not shipped in simple-icons v15, so its mark lives here. */
const LINKEDIN: IconShape = {
  title: 'LinkedIn',
  path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
}

const ICONS: Record<string, IconShape> = {
  github: siGithub,
  linkedin: LINKEDIN,
  instagram: siInstagram,
  x: siX,
}

export type BrandIconName = keyof typeof ICONS

export function BrandIcon({
  name,
  size = 14,
  className,
}: {
  name: BrandIconName
  size?: number
  className?: string
}) {
  const icon = ICONS[name]
  return (
    <svg
      role="img"
      aria-label={icon.title}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn('shrink-0 fill-current', className)}
    >
      <path d={icon.path} />
    </svg>
  )
}
