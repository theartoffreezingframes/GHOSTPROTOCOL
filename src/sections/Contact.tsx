import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { ArrowUpRight, Lock, Mail } from 'lucide-react'

import { brand, contact, type Channel } from '../data/site'
import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'
import { Reveal } from '../components/Reveal'
import { MaskedLines } from '../components/MaskedLines'
import { Magnetic } from '../components/Magnetic'
import { BrandIcon } from '../components/BrandIcon'

const CHANNEL_ICON = ({ channel }: { channel: Channel }) =>
  channel.key === 'email' ? (
    <Mail size={14} aria-hidden="true" />
  ) : (
    <BrandIcon name={channel.key} size={14} />
  )

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative overflow-hidden border-t border-line-soft bg-abyss py-24 sm:py-32 lg:py-40"
    >
      <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden="true">
        <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000,transparent_80%)]" />
        <div className="absolute left-1/2 top-1/2 h-[40rem] w-[min(60rem,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald/[0.055] blur-[140px]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-void to-transparent" />
      </div>

      <div className="container-x relative z-10">
        <motion.div
          className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
        >
          <span className="font-tech text-[0.66rem] tracking-[0.28em] text-neon">{contact.index}</span>
          <span className="font-tech text-[0.66rem] tracking-[0.28em] text-mute" aria-hidden="true">
            //
          </span>
          <span className="font-tech text-[0.66rem] tracking-[0.28em] text-mute">{contact.label}</span>
          <span className="hidden h-px flex-1 bg-line sm:block" aria-hidden="true" />
        </motion.div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <MaskedLines
              lines={contact.heading}
              as="h2"
              id="contact-heading"
              className="display-section max-w-2xl text-bone"
              amount={0.3}
            />

            <Reveal delay={0.2} className="mt-7 max-w-md">
              <p className="text-[1.05rem] leading-relaxed text-bone/85">{contact.support}</p>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-mute">{contact.invite}</p>
            </Reveal>

            {/* terminal handshake */}
            <Reveal delay={0.28} className="mt-9">
              <HandshakeTerminal />
            </Reveal>
          </div>

          {/* channels */}
          <div className="lg:col-span-5">
            <Reveal delay={0.15}>
              <div className="mb-4 flex items-center justify-between border-b border-line-soft pb-3">
                <span className="font-tech text-[0.58rem] tracking-[0.22em] text-mute">OPEN CHANNELS</span>
                <span className="font-tech flex items-center gap-1.5 text-[0.62rem] tracking-[0.18em] text-neon/70">
                  <span className="h-1 w-1 rounded-full bg-neon animate-pulse-dot" aria-hidden="true" />
                  LISTENING
                </span>
              </div>

              <ul className="divide-y divide-line-soft border-b border-line-soft">
                {contact.channels.map((channel, index) => (
                  <ChannelRow key={channel.key} channel={channel} index={index} />
                ))}
              </ul>

              <div className="mt-6 flex items-start gap-3">
                <Lock size={11} className="mt-0.5 shrink-0 text-mute/50" aria-hidden="true" />
                <p className="font-tech text-[0.62rem] leading-relaxed tracking-[0.16em] text-mute/45">
                  PUBLIC CHANNELS ARE PUBLISHED ONLY AFTER THE UNIT CONFIRMS THEM. NO UNVERIFIED CONTACT DETAILS
                  APPEAR HERE.
                </p>
              </div>
            </Reveal>
          </div>
        </div>

        {/* closing signature */}
        <div className="mt-20 sm:mt-28">
          <ClosingSequence />
        </div>
      </div>
    </section>
  )
}

function ChannelRow({ channel, index }: { channel: Channel; index: number }) {
  const active = Boolean(channel.href)

  const content = (
    <>
      <span className="font-tech w-6 shrink-0 text-[0.62rem] tracking-[0.18em] text-mute/40">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center border transition-colors duration-500',
          active
            ? 'border-neon/35 text-neon group-hover:border-neon group-hover:bg-neon/10'
            : 'border-line text-mute/50',
        )}
      >
        <CHANNEL_ICON channel={channel} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'font-tech block text-[0.58rem] tracking-[0.18em] transition-colors duration-400',
            active ? 'text-bone group-hover:text-neon' : 'text-mute/70',
          )}
        >
          {channel.label.toUpperCase()}
        </span>
        <span className="font-tech mt-1 block truncate text-[0.62rem] tracking-[0.14em] text-mute/45">
          {channel.handle ?? contact.pendingLabel}
        </span>
      </span>
      <span
        className={cn(
          'font-tech flex shrink-0 items-center gap-1 text-[0.62rem] tracking-[0.16em] transition-all duration-400',
          active ? 'text-neon/70 group-hover:translate-x-0.5 group-hover:text-neon' : 'text-mute/30',
        )}
      >
        {active ? (
          <>
            OPEN
            <ArrowUpRight size={10} aria-hidden="true" />
          </>
        ) : (
          'SEALED'
        )}
      </span>
    </>
  )

  return (
    <li>
      {active ? (
        <a
          href={channel.href!}
          target={channel.key === 'email' ? undefined : '_blank'}
          rel="noopener noreferrer"
          className="group flex items-center gap-3 py-3.5 transition-colors"
        >
          {content}
        </a>
      ) : (
        <div
          className="group flex items-center gap-3 py-3.5 opacity-80"
          title="Not yet published by the team"
          aria-label={`${channel.label} — channel pending`}
        >
          {content}
        </div>
      )}
    </li>
  )
}

const TYPE_LINES = [
  { prompt: 'gp@node03:~$', text: 'initiate --handshake', tone: 'cmd' as const },
  { prompt: '>', text: 'negotiating secure channel … OK', tone: 'ok' as const },
  { prompt: '>', text: 'cipher suite : AES-256-GCM', tone: 'dim' as const },
  { prompt: '>', text: 'route : onion // hops 3', tone: 'dim' as const },
  { prompt: 'gp@node03:~$', text: 'status', tone: 'cmd' as const },
]

function HandshakeTerminal() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const reduce = useReducedMotion()
  const [visibleLines, setVisibleLines] = useState(0)
  const [typed, setTyped] = useState('')

  // typewriter for the first command, then reveal the rest line by line
  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setVisibleLines(TYPE_LINES.length)
      setTyped(TYPE_LINES[0].text)
      return
    }
    const first = TYPE_LINES[0].text
    let i = 0
    const typer = window.setInterval(() => {
      i += 1
      setTyped(first.slice(0, i))
      if (i >= first.length) {
        window.clearInterval(typer)
        let line = 1
        const reveal = window.setInterval(() => {
          line += 1
          setVisibleLines(line)
          if (line > TYPE_LINES.length) window.clearInterval(reveal)
        }, 520)
      }
    }, 45)
    return () => window.clearInterval(typer)
  }, [inView, reduce])

  return (
    <div ref={ref} className="relative max-w-md overflow-hidden border border-line-soft bg-[#070b08]">
      <div className="flex items-center justify-between border-b border-line-soft px-3.5 py-2">
        <span className="font-tech text-[0.62rem] tracking-[0.2em] text-mute/60">SECURE HANDSHAKE</span>
        <span className="font-tech flex items-center gap-1.5 text-[0.54rem] tracking-[0.16em] text-neon/70">
          <span className="h-1 w-1 rounded-full bg-neon animate-pulse-dot" aria-hidden="true" />
          LIVE
        </span>
      </div>
      <div className="space-y-1.5 p-3.5" aria-live="polite">
        <p className="font-tech text-[0.62rem] tracking-[0.1em] text-bone/85">
          <span className="text-neon">{TYPE_LINES[0].prompt}</span> {typed}
          {typed.length < TYPE_LINES[0].text.length && (
            <span className="ml-0.5 inline-block h-3 w-[5px] translate-y-[1px] bg-neon animate-blink" aria-hidden="true" />
          )}
        </p>
        {TYPE_LINES.slice(1).map((line, i) => (
          <motion.p
            key={line.text}
            className={cn(
              'font-tech text-[0.6rem] tracking-[0.1em]',
              line.tone === 'ok' ? 'text-emerald' : line.tone === 'cmd' ? 'text-bone/85' : 'text-mute/60',
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: visibleLines > i ? 1 : 0 }}
            transition={{ duration: 0.35 }}
          >
            <span className={line.tone === 'cmd' ? 'text-neon' : 'text-mute/40'}>{line.prompt}</span> {line.text}
          </motion.p>
        ))}
      </div>
    </div>
  )
}

function ClosingSequence() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const [step, setStep] = useState(reduce ? contact.closing.length : 0)

  useEffect(() => {
    if (!inView || reduce) return
    const timers = contact.closing.map((_, i) =>
      window.setTimeout(() => setStep(i + 1), 700 + i * 750),
    )
    return () => timers.forEach(clearTimeout)
  }, [inView, reduce])

  return (
    <div ref={ref} className="relative">
      <div className="mb-8 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-neon/30 to-transparent" />
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="space-y-2" aria-live="polite">
          {contact.closing.map((line, i) => (
            <motion.p
              key={line}
              className={cn(
                'font-tech text-[0.58rem] tracking-[0.26em] sm:text-[0.66rem]',
                i === 0 ? 'text-emerald' : i === 1 ? 'text-bone/80' : 'text-mute',
              )}
              initial={{ opacity: 0, y: reduce ? 0 : 8 }}
              animate={{ opacity: step > i ? 1 : 0, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
            >
              {line}
            </motion.p>
          ))}
        </div>

        <motion.div
          className="mt-12 flex items-center gap-4 sm:mt-16"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: step >= contact.closing.length ? 1 : 0.25, y: 0 }}
          transition={{ duration: 1, ease: EASE_OUT_EXPO }}
        >
          <Magnetic strength={6}>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault()
                const el = document.getElementById('top')
                el?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
              }}
              className="group inline-flex items-baseline gap-1"
              aria-label="Back to the top of the page"
            >
              <span className="font-display text-[clamp(1.9rem,7vw,4.4rem)] font-semibold uppercase leading-none tracking-[-0.04em] text-bone transition-colors duration-500 group-hover:text-neon">
                {brand.signature}
              </span>
              <span className="mb-2 inline-block h-[0.55em] w-[0.28em] bg-neon animate-blink sm:mb-3" aria-hidden="true" />
            </a>
          </Magnetic>
        </motion.div>

        <p className="font-tech mt-4 text-[0.62rem] tracking-[0.24em] text-mute/40">
          END OF TRANSMISSION // ARCHIVE SEALED
        </p>
      </div>
    </div>
  )
}
