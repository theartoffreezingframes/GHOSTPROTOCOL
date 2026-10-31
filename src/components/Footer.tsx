import { motion, useReducedMotion } from 'motion/react'

import { brand, nav } from '../data/site'
import { Emblem } from './Emblem'
import { UtcClock } from './Clock'

type FooterProps = {
  onNavigate: (id: string) => void
}

export function Footer({ onNavigate }: FooterProps) {
  const reduce = useReducedMotion()
  const year = new Date().getFullYear()

  return (
    <footer
      id="site-footer"
      className="relative overflow-hidden border-t border-line-soft bg-void pt-14 sm:pt-20"
    >
      {/* ambient wash */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-x-0 bottom-0 h-64 bg-[radial-gradient(ellipse_60%_100%_at_50%_120%,rgba(57,255,20,0.13),transparent_70%)]" />
        <div className="absolute inset-0 grid-bg opacity-20 [mask-image:linear-gradient(to_top,#000,transparent)]" />
      </div>

      <div className="container-x relative z-10">
        <div className="flex flex-col gap-10 border-b border-line-soft pb-12 lg:flex-row lg:items-start lg:justify-between">
          {/* identity */}
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9">
                <Emblem />
              </span>
              <div>
                <p className="font-display text-[0.95rem] font-semibold uppercase leading-none tracking-[0.14em] text-bone">
                  {brand.name}
                </p>
                <p className="font-tech mt-1.5 text-[0.62rem] tracking-[0.2em] text-mute/60">
                  {brand.classification}
                </p>
              </div>
            </div>
            <p className="font-display mt-6 text-[1.15rem] font-medium uppercase leading-tight tracking-[-0.01em] text-bone/80">
              {brand.tagline}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-neon animate-pulse-dot" aria-hidden="true" />
              <span className="font-tech text-[0.62rem] tracking-[0.2em] text-mute/60">
                SYSTEM ONLINE // <UtcClock />
              </span>
            </div>
          </div>

          {/* directory */}
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2 sm:grid-cols-3">
            {nav.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  onNavigate(item.id)
                }}
                className="group font-tech flex items-center gap-2 py-2 text-[0.58rem] tracking-[0.18em] text-mute transition-colors hover:text-neon"
              >
                <span className="text-[0.54rem] text-mute/40 transition-colors group-hover:text-neon/60">
                  {item.index}
                </span>
                {item.label.toUpperCase()}
              </a>
            ))}
          </nav>
        </div>

        {/* oversized wordmark */}
        <div className="relative select-none overflow-hidden py-8 sm:py-10" aria-hidden="true">
          <motion.p
            className="font-display w-full whitespace-nowrap text-center text-[clamp(2.2rem,11.4vw,13rem)] font-semibold uppercase leading-[0.78] tracking-[-0.055em] text-transparent"
            style={{
              WebkitTextStroke: '1px rgba(57,255,20,0.16)',
            }}
            initial={{ opacity: 0, y: reduce ? 0 : 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
          >
            GHOST PROTOCOL
          </motion.p>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="h-px w-full max-w-4xl bg-gradient-to-r from-transparent via-neon/20 to-transparent" />
          </div>
        </div>

        {/* bottom bar */}
        <div className="flex flex-col items-start justify-between gap-3 border-t border-line-soft py-5 sm:flex-row sm:items-center">
          <p className="font-tech text-[0.62rem] leading-relaxed tracking-[0.18em] text-mute/50">
            © {year} {brand.name} // ALL OPERATIONS CLASSIFIED
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="font-tech text-[0.62rem] tracking-[0.18em] text-mute/40">
              BUILD 0.3.1
            </span>
            <span className="font-tech text-[0.62rem] tracking-[0.18em] text-mute/40">
              {brand.statements[1]}
            </span>
            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
              }}
              className="font-tech group flex items-center gap-1.5 py-2 pr-1 text-[0.62rem] tracking-[0.18em] text-mute/60 transition-colors hover:text-neon"
            >
              BACK TO TOP
              <span className="transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden="true">
                ↑
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
