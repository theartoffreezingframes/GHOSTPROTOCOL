import { cn } from '../lib/utils'

type EmblemProps = {
  className?: string
  /** Adds the slow rotating clearance ring. */
  animated?: boolean
  title?: string
}

/**
 * GHOST PROTOCOL // EMBLEM
 * Original mark: a ghost silhouette carved with the protocol's
 * circuit-cut visor, inside a hexagonal shield and a dashed
 * clearance ring. Pure vector, scales from favicon to hero size.
 */
export function Emblem({ className, animated = false, title = 'Ghost Protocol emblem' }: EmblemProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={cn('h-full w-full overflow-visible', className)}
      role="img"
      aria-label={title}
      fill="none"
    >
      <defs>
        <linearGradient id="gp-emblem-fill" x1="30" y1="18" x2="92" y2="104" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#B6FFA0" />
          <stop offset="42%" stopColor="#39FF14" />
          <stop offset="100%" stopColor="#00C853" />
        </linearGradient>
        <linearGradient id="gp-ring" x1="10" y1="10" x2="110" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#39FF14" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#39FF14" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#39FF14" stopOpacity="0.1" />
        </linearGradient>
        <clipPath id="gp-ghost-body">
          <path d="M33 92V53C33 33.5 45 20.5 60 20.5S87 33.5 87 53v39l-9.2-7.8-8.6 9.2L60 86l-9.2 7.4-8.6-9.2L33 92Z" />
        </clipPath>
      </defs>

      {/* Clearance ring */}
      <circle
        cx="60"
        cy="60"
        r="55"
        stroke="url(#gp-ring)"
        strokeWidth="0.9"
        strokeDasharray="2 7"
        className={animated ? 'origin-center motion-safe:[animation:gp-radar_38s_linear_infinite]' : undefined}
        opacity="0.8"
      />
      <circle cx="60" cy="60" r="49" stroke="#39FF14" strokeOpacity="0.14" strokeWidth="0.6" />

      {/* Hexagonal shield */}
      <path
        d="M60 5.5 106.5 29v54L60 106.5 13.5 83V29L60 5.5Z"
        stroke="#39FF14"
        strokeOpacity="0.24"
        strokeWidth="1.1"
      />
      <path
        d="M60 12 100.5 33v46L60 100 19.5 79V33L60 12Z"
        stroke="#39FF14"
        strokeOpacity="0.5"
        strokeWidth="0.7"
        strokeDasharray="12 5"
      />

      {/* Ghost body */}
      <path
        d="M33 92V53C33 33.5 45 20.5 60 20.5S87 33.5 87 53v39l-9.2-7.8-8.6 9.2L60 86l-9.2 7.4-8.6-9.2L33 92Z"
        fill="url(#gp-emblem-fill)"
      />

      {/* Circuit-cut visor + glitch slicing */}
      <g clipPath="url(#gp-ghost-body)">
        <rect x="41" y="44" width="9.5" height="16" rx="2" fill="#050706" />
        <rect x="69.5" y="44" width="9.5" height="16" rx="2" fill="#050706" />
        <rect x="24" y="64.5" width="72" height="4.2" fill="#050706" />
        <rect x="24" y="72.5" width="34" height="3" fill="#050706" opacity="0.85" />
        <rect x="66" y="72.5" width="30" height="3" fill="#050706" opacity="0.5" />
      </g>

      {/* Registration ticks */}
      <g fill="#39FF14">
        <rect x="8" y="70" width="4" height="4" />
        <rect x="108" y="40" width="4" height="4" fill="#00C853" fillOpacity="0.85" />
        <rect x="52" y="8" width="4" height="2" fillOpacity="0.5" />
      </g>
    </svg>
  )
}
