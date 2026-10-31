import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'

import { about, brand } from '../data/site'
import { EASE_OUT_EXPO } from '../lib/motion'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { DecodeLabel } from '../components/DecodeLabel'

/**
 * SECTION 01 — THE PROTOCOL
 * Editorial asymmetry: oversized statement on the left, philosophy
 * rail on the right, and a slow-rotating wireframe glyph behind it.
 */
export function About() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const rotate = useTransform(scrollYProgress, [0, 1], [-14, 14])
  const glyphY = useTransform(scrollYProgress, [0, 1], ['8%', '-8%'])
  const lineGrow = useTransform(scrollYProgress, [0.15, 0.5], [0, 1])

  return (
    <section
      id="protocol"
      aria-labelledby="protocol-heading"
      className="relative overflow-hidden border-t border-line-soft bg-abyss py-24 sm:py-32 lg:py-40"
    >
      {/* atmosphere */}
      <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden="true">
        <div className="absolute inset-0 grid-bg opacity-[0.55]" />
        <div className="absolute -left-40 top-1/4 h-[38rem] w-[min(38rem,88vw)] rounded-full bg-emerald/[0.05] blur-[130px]" />
        <motion.div
          className="absolute -right-[12%] top-1/2 h-[26rem] w-[min(24rem,72vw)] -translate-y-1/2 opacity-[0.16] sm:h-[34rem] sm:w-[min(34rem,86vw)]"
          style={reduce ? undefined : { rotate, y: glyphY }}
        >
          <svg viewBox="0 0 400 400" className="h-full w-full" fill="none">
            <circle cx="200" cy="200" r="186" stroke="#39FF14" strokeWidth="0.6" strokeDasharray="3 9" />
            <circle cx="200" cy="200" r="148" stroke="#39FF14" strokeWidth="0.5" strokeOpacity="0.6" />
            <circle cx="200" cy="200" r="108" stroke="#00C853" strokeWidth="0.5" strokeOpacity="0.5" />
            <path d="M200 14v372M14 200h372" stroke="#39FF14" strokeWidth="0.4" strokeOpacity="0.35" />
            <path
              d="M200 52 328 126v148L200 348 72 274V126L200 52Z"
              stroke="#39FF14"
              strokeWidth="0.8"
              strokeOpacity="0.45"
            />
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2
              return (
                <circle
                  key={i}
                  cx={200 + Math.cos(angle) * 186}
                  cy={200 + Math.sin(angle) * 186}
                  r="2"
                  fill="#39FF14"
                  fillOpacity="0.7"
                />
              )
            })}
          </svg>
        </motion.div>
      </div>

      <div ref={ref} className="container-x relative z-10">
        <SectionHeading
          id="protocol-heading"
          index={about.index}
          label={about.label}
          lines={about.heading}
          headingClassName="max-w-4xl"
          aside={
            <span className="font-tech ml-auto hidden text-[0.7rem] tracking-[0.22em] text-mute/75 md:block">
              FILE // <DecodeLabel value="GP-01" />
            </span>
          }
        >
          <Reveal delay={0.15}>
            <p className="font-tech mb-3 text-[0.7rem] tracking-[0.24em] text-neon/80">MANIFESTO</p>
            <p className="text-[0.95rem] leading-relaxed text-mute">
              Built in the space between curiosity and discipline. We operate independently, compete relentlessly and
              ship what we imagine.
            </p>
          </Reveal>
        </SectionHeading>

        {/* editorial body */}
        <div className="mt-16 grid grid-cols-1 gap-x-14 gap-y-12 sm:mt-20 lg:grid-cols-12">
          <div className="lg:col-span-7 lg:col-start-1">
            <div className="space-y-6">
              {about.body.map((paragraph, i) => (
                <Reveal as="p" key={paragraph} delay={0.05 + i * 0.1} y={22}
                  className={
                    i === 0
                      ? 'text-[1.08rem] leading-[1.75] text-bone/90 sm:text-[1.22rem]'
                      : 'text-[0.98rem] leading-[1.85] text-mute sm:text-[1.02rem]'
                  }
                >
                  {paragraph}
                </Reveal>
              ))}
            </div>

            {/* stats rail */}
            <Reveal delay={0.15} className="mt-12">
              <dl className="grid grid-cols-2 divide-line-soft border-y border-line-soft sm:grid-cols-4 sm:divide-x">
                {about.stats.map((stat) => (
                  <div key={stat.label} className="px-0 py-5 sm:px-6 sm:first:pl-0">
                    <dt className="font-tech text-[0.7rem] tracking-[0.2em] text-mute">{stat.label}</dt>
                    <dd className="font-display mt-2 flex items-baseline gap-2 text-[2rem] font-medium leading-none tracking-tight text-bone">
                      {stat.value}
                      <span className="font-tech text-[0.66rem] tracking-[0.16em] text-neon/70">{stat.note}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          {/* philosophy rail — sticky on desktop */}
          <div className="lg:col-span-4 lg:col-start-9">
            <div className="lg:sticky lg:top-28">
              <div className="mb-5 flex items-center gap-3">
                <span className="font-tech text-[0.7rem] tracking-[0.24em] text-mute">OUR PHILOSOPHY</span>
                <motion.span
                  className="h-px flex-1 origin-left bg-neon/40"
                  style={reduce ? undefined : { scaleX: lineGrow }}
                  aria-hidden="true"
                />
              </div>

              <ul className="space-y-0">
                {brand.philosophy.map((line, i) => (
                  <motion.li
                    key={line}
                    className="group relative border-t border-line-soft py-5 last:border-b"
                    initial={reduce ? false : { opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 'some', margin: '160% 0px 15% 0px' }}
                    transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.12 * i }}
                  >
                    <span className="font-tech absolute right-0 top-5 text-[0.66rem] tracking-[0.2em] text-mute/70">
                      0{i + 1}
                    </span>
                    <span className="font-display block text-[1.35rem] font-medium uppercase leading-tight tracking-[-0.02em] text-bone transition-colors duration-500 group-hover:text-neon sm:text-[1.55rem]">
                      {line}
                    </span>
                  </motion.li>
                ))}
              </ul>

              <Reveal delay={0.2} className="mt-8">
                <blockquote className="relative border-l border-neon/40 pl-5">
                  <p className="text-[0.86rem] leading-relaxed text-mute">
                    “We don't announce ourselves. We leave evidence.”
                  </p>
                  <footer className="font-tech mt-3 text-[0.7rem] tracking-[0.22em] text-neon/70">
                    {brand.name} // DOCTRINE
                  </footer>
                </blockquote>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
