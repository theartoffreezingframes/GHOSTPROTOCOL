import { useRef } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { ArrowDownRight, CornerDownRight, ShieldCheck, Terminal } from 'lucide-react'

import { brand, hero } from '../data/site'
import { MEDIA, imageSrcSet, imageFallback } from '../lib/media'
import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'
import { DigitalRain } from '../components/DigitalRain'
import { HudFrame } from '../components/HudFrame'
import { Magnetic } from '../components/Magnetic'
import { UtcClock } from '../components/Clock'
import { DecodeLabel } from '../components/DecodeLabel'

type HeroProps = {
  ready: boolean
  onNavigate: (id: string) => void
}

const HEADLINE = [
  ['WE', 'ARE', 'THE', 'GHOSTS'],
  ['IN', 'THE', 'MACHINE.'],
]

export function Hero({ ready, onNavigate }: HeroProps) {
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 26, restDelta: 0.001 })
  const imageY = useTransform(smooth, [0, 1], ['0%', '14%'])
  const imageScale = useTransform(smooth, [0, 1], [1.04, 1.14])
  const contentY = useTransform(smooth, [0, 1], ['0%', '-18%'])
  const contentOpacity = useTransform(smooth, [0, 0.72], [1, 0])
  const veil = useTransform(smooth, [0, 1], [0.3, 0.9])

  const delay = (base: number) => (ready ? base : 0.05)

  return (
    <section
      ref={sectionRef}
      id="top"
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-void pb-8 pt-28 sm:pb-10 lg:min-h-[104svh]"
    >
      {/* ── Background stack ───────────────────────────────── */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <motion.div
          className="absolute inset-0"
          style={reduce ? undefined : { y: imageY, scale: imageScale }}
        >
          <img
            src={imageFallback(MEDIA.hero)}
            srcSet={imageSrcSet(MEDIA.hero)}
            sizes="100vw"
            alt=""
            width={1600}
            height={900}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover object-center opacity-[0.85] brightness-[1.08] saturate-[1.05]"
          />
        </motion.div>

        {/* cinematic grade + vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/45 to-void/65" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_38%,transparent_0%,rgba(5,7,6,0.72)_78%,#050706_100%)]" />
        <motion.div className="absolute inset-0 bg-void" style={reduce ? { opacity: 0.42 } : { opacity: veil }} />

        {/* digital rain — sits behind the type */}
        <div className="absolute inset-0 opacity-[0.32]">
          <DigitalRain className="digital-rain" density={0.75} opacity={0.55} />
        </div>

        {/* ambient green bloom */}
        <div
          className="absolute left-1/2 top-[30%] h-[52vmax] w-[52vmax] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.22] blur-[110px]"
          style={{ background: 'radial-gradient(circle, #39FF14 0%, #00C853 35%, transparent 72%)' }}
        />

        {/* HUD grid + scan */}
        <div className="absolute inset-0 hud-grid opacity-[0.5] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_40%,#000,transparent_85%)]" />
        <div className="absolute inset-x-0 h-[38vh] animate-scanline bg-gradient-to-b from-transparent via-neon/[0.035] to-transparent" />
        <div className="absolute inset-0 noise-overlay opacity-[0.35] mix-blend-soft-light" />
      </div>

      {/* ── HUD chrome ─────────────────────────────────────── */}
      <div className="container-x relative z-20">
        <motion.div
          className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: delay(0.1) }}
        >
          <span className="font-tech text-[0.6rem] tracking-[0.26em] text-mute sm:text-[0.58rem]">
            {brand.eyebrow}
          </span>
          <div className="hidden items-center gap-5 sm:flex">
            <span className="font-tech text-[0.6rem] tracking-[0.2em] text-mute/70">
              <UtcClock />
            </span>
            <span className="font-tech text-[0.6rem] tracking-[0.2em] text-mute/70">
              NODE <DecodeLabel value="0x7F3A" className="text-neon/80" />
            </span>
            <span className="font-tech flex items-center gap-1.5 text-[0.6rem] tracking-[0.2em] text-neon">
              <span className="h-1 w-1 rounded-full bg-neon animate-pulse-dot" aria-hidden="true" />
              UPLINK
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Main composition ───────────────────────────────── */}
      <motion.div
        className="container-x relative z-20 mt-auto pt-10 sm:pt-14"
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-12 lg:items-end lg:gap-x-8">
          {/* headline block */}
          <div className="lg:col-span-9">
            <h1 id="hero-heading" className="sr-only">
              {hero.headline.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>

            <div
              aria-hidden="true"
              className="font-display text-[clamp(2.35rem,8.1vw,8.2rem)] font-semibold uppercase leading-[0.88] tracking-[-0.045em] text-bone"
            >
              {HEADLINE.map((line, lineIndex) => (
                <span key={lineIndex} className="flex flex-wrap items-baseline gap-x-[0.22em] overflow-hidden pb-[0.06em]">
                  {line.map((word, wordIndex) => {
                    const globalIndex = lineIndex * 4 + wordIndex
                    const isAccent = word === 'GHOSTS'
                    return (
                      <span key={word} className="inline-block overflow-hidden">
                        <motion.span
                          className={cn(
                            'inline-block will-change-transform',
                            isAccent && 'italic text-neon text-glow',
                          )}
                          initial={reduce ? { opacity: 0 } : { y: '108%', opacity: 0 }}
                          animate={ready ? { y: '0%', opacity: 1 } : { y: '108%', opacity: 0 }}
                          transition={{
                            duration: reduce ? 0.4 : 1.25,
                            ease: EASE_OUT_EXPO,
                            delay: delay(0.25 + globalIndex * 0.075),
                          }}
                        >
                          {word}
                        </motion.span>
                      </span>
                    )
                  })}
                </span>
              ))}
            </div>

            {/* support lines */}
            <motion.div
              className="mt-8 flex flex-col gap-5 sm:mt-10 sm:flex-row sm:items-end sm:justify-between sm:gap-10"
              initial={{ opacity: 0, y: 18 }}
              animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: delay(0.95) }}
            >
              <ul className="space-y-1.5">
                {hero.support.map((line) => (
                  <li key={line} className="flex items-center gap-3 text-[0.95rem] text-bone/85 sm:text-[1.02rem]">
                    <span className="h-px w-5 shrink-0 bg-neon/70" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>

              <p className="max-w-xs text-[0.82rem] leading-relaxed text-mute lg:max-w-[19rem]">
                {hero.description}
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              className="mt-9 flex flex-col gap-3 sm:mt-11 sm:flex-row sm:items-center sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: delay(1.1) }}
            >
              <Magnetic strength={8}>
                <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={() => onNavigate('contact')}>
                  <Terminal size={14} strokeWidth={2} aria-hidden="true" />
                  {hero.primaryCta}
                </button>
              </Magnetic>
              <Magnetic strength={6}>
                <button type="button" className="btn btn-ghost w-full sm:w-auto" onClick={() => onNavigate('missions')}>
                  {hero.secondaryCta}
                  <ArrowDownRight size={14} aria-hidden="true" />
                </button>
              </Magnetic>
            </motion.div>
          </div>

          {/* system status panel */}
          <motion.aside
            className="lg:col-span-3 lg:pb-2"
            initial={{ opacity: 0, x: 22 }}
            animate={ready ? { opacity: 1, x: 0 } : { opacity: 0, x: 22 }}
            transition={{ duration: 1.1, ease: EASE_OUT_EXPO, delay: delay(1.25) }}
            aria-label="System status"
          >
            <div className="relative border border-line-soft bg-void/45 p-4 backdrop-blur-md sm:p-5">
              <HudFrame />
              <div className="mb-3 flex items-center justify-between">
                <span className="font-tech text-[0.6rem] tracking-[0.24em] text-mute">SYS_MONITOR</span>
                <ShieldCheck size={12} className="text-neon/70" aria-hidden="true" />
              </div>
              <dl className="space-y-2.5">
                {hero.status.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-3 border-b border-line-soft/70 pb-2 last:border-0 last:pb-0"
                  >
                    <dt className="font-tech text-[0.6rem] tracking-[0.18em] text-mute">{row.label}</dt>
                    <dd
                      className={cn(
                        'font-tech flex items-center gap-1.5 text-[0.58rem] tracking-[0.16em]',
                        row.state === 'online' && 'text-neon',
                        row.state === 'alert' && 'text-bone',
                        row.state === 'neutral' && 'text-bone',
                      )}
                    >
                      {row.state === 'online' && (
                        <span className="h-1 w-1 rounded-full bg-neon animate-pulse-dot" aria-hidden="true" />
                      )}
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* waveform */}
              <div className="mt-4 flex h-6 items-end gap-[3px]" aria-hidden="true">
                {Array.from({ length: 26 }).map((_, i) => (
                  <span
                    key={i}
                    className="w-full origin-bottom bg-neon/45"
                    style={{
                      height: `${18 + Math.abs(Math.sin(i * 0.9)) * 82}%`,
                      animation: reduce ? undefined : `gp-bars ${1.4 + (i % 5) * 0.22}s ease-in-out ${i * 0.05}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.aside>
        </div>

        {/* bottom rail */}
        <motion.div
          className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line-soft pt-4 sm:mt-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 1, delay: delay(1.4) }}
        >
          <a
            href="#protocol"
            onClick={(e) => {
              e.preventDefault()
              onNavigate('protocol')
            }}
            className="group font-tech flex items-center gap-3 text-[0.6rem] tracking-[0.22em] text-mute transition-colors hover:text-neon"
          >
            <span className="flex h-7 w-7 items-center justify-center border border-line transition-colors group-hover:border-neon/60">
              <ArrowDownRight size={11} className="transition-transform duration-500 group-hover:rotate-90" aria-hidden="true" />
            </span>
            SCROLL TO DECRYPT
          </a>

          <a
            href="#protocol"
            onClick={(e) => {
              e.preventDefault()
              onNavigate('protocol')
            }}
            className="font-tech flex items-center gap-2 text-[0.62rem] tracking-[0.22em] text-mute/70 transition-colors hover:text-neon md:hidden"
          >
            <span className="h-1 w-1 rounded-full bg-neon animate-pulse-dot" aria-hidden="true" />
            01 — 07
          </a>

          <div className="hidden items-center gap-6 md:flex">
            {brand.statements.map((statement) => (
              <span key={statement} className="font-tech flex items-center gap-2 text-[0.6rem] tracking-[0.2em] text-mute/70">
                <CornerDownRight size={9} className="text-neon/50" aria-hidden="true" />
                {statement}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
