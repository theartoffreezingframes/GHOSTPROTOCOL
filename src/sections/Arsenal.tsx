import { useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { Cpu, Terminal } from 'lucide-react'

import { arsenal, arsenalDisclaimer } from '../data/site'
import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'

const PROMPT = '$ arsenal --list'

export function Arsenal() {
  const reduce = useReducedMotion()
  const [activeCat, setActiveCat] = useState(arsenal[0].id)
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.8], ['0%', '100%'])

  return (
    <section
      ref={sectionRef}
      id="arsenal"
      aria-labelledby="arsenal-heading"
      className="relative overflow-hidden border-t border-line-soft bg-abyss py-24 sm:py-32 lg:py-40"
    >
      <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden="true">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute right-1/4 top-0 h-[24rem] w-[min(40rem,90vw)] rounded-full bg-emerald/[0.05] blur-[130px]" />
        {/* vertical technical scale */}
        <motion.div
          className="absolute left-4 top-0 hidden w-px bg-gradient-to-b from-transparent via-neon/25 to-transparent lg:block xl:left-8"
          style={{ height: reduce ? '60%' : lineHeight }}
        />
      </div>

      <div className="container-x relative z-10">
        <SectionHeading
          index="05"
          id="arsenal-heading"
          label="TECHNICAL ARSENAL"
          lines={['OUR TOOLS.', 'OUR CAPABILITIES.']}
          aside={
            <span className="font-tech ml-auto hidden text-[0.7rem] tracking-[0.22em] text-mute/70 md:block">
              INDEX // 04 CATEGORIES
            </span>
          }
        >
          <Reveal delay={0.2}>
            <p className="text-[0.95rem] leading-relaxed text-mute">
              A working landscape of languages, systems and security fundamentals the collective builds with.
            </p>
          </Reveal>
        </SectionHeading>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:mt-20 lg:grid-cols-12 lg:gap-8">
          {/* terminal panel */}
          <Reveal className="lg:col-span-7" y={30}>
            <div className="relative overflow-hidden border border-line-soft bg-[#070b08]">
              {/* title bar */}
              <div className="flex items-center justify-between border-b border-line-soft px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-line" aria-hidden="true" />
                  <span className="h-2 w-2 rounded-full bg-line" aria-hidden="true" />
                  <span className="h-2 w-2 rounded-full bg-neon/60" aria-hidden="true" />
                  <span className="font-tech ml-2 text-[0.66rem] tracking-[0.2em] text-mute/70">
                    ghost@protocol: ~/arsenal
                  </span>
                </div>
                <Terminal size={11} className="text-neon/50" aria-hidden="true" />
              </div>

              {/* log */}
              <div className="p-4 sm:p-6">
                <p className="font-tech flex items-center gap-2 text-[0.7rem] tracking-[0.14em] text-bone/80">
                  <span className="text-neon" aria-hidden="true">
                    →
                  </span>
                  {PROMPT}
                  <span className="inline-block h-3 w-[6px] bg-neon/80 animate-blink" aria-hidden="true" />
                </p>

                <div className="mt-5 space-y-4">
                  {arsenal.map((category, catIndex) => {
                    const isActive = activeCat === category.id
                    return (
                      <motion.div
                        key={category.id}
                        className={cn(
                          'relative border-l transition-colors duration-500',
                          isActive ? 'border-neon/60' : 'border-line',
                        )}
                        initial={reduce ? false : { opacity: 0, x: reduce ? 0 : -14 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 'some', margin: '160% 0px 15% 0px' }}
                        transition={{ duration: 0.7, delay: catIndex * 0.1, ease: EASE_OUT_EXPO }}
                        onMouseEnter={() => setActiveCat(category.id)}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveCat(category.id)}
                          onFocus={() => setActiveCat(category.id)}
                          aria-pressed={isActive}
                          className="flex w-full flex-wrap items-baseline gap-x-3 gap-y-1 pl-3 text-left sm:pl-4"
                        >
                          <span className="font-tech text-[0.66rem] tracking-[0.16em] text-neon/60">
                            [{category.index}]
                          </span>
                          <span
                            className={cn(
                              'font-tech text-[0.7rem] tracking-[0.16em] transition-colors duration-300',
                              isActive ? 'text-neon' : 'text-bone/80',
                            )}
                          >
                            {category.title}
                          </span>
                          <span className="font-tech ml-auto hidden text-[0.7rem] tracking-[0.16em] text-mute/70 sm:block">
                            {category.note}
                          </span>
                        </button>

                        <ul className="mt-3 flex flex-wrap gap-1.5 pb-4 pl-3 sm:pl-4">
                          {category.items.map((item, i) => (
                            <motion.li
                              key={item}
                              initial={reduce ? false : { opacity: 0, y: reduce ? 0 : 8 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true, amount: 'some', margin: '160% 0px 15% 0px' }}
                              transition={{ duration: 0.45, delay: catIndex * 0.08 + i * 0.045, ease: EASE_OUT_EXPO }}
                            >
                              <SkillTag label={item} active={isActive} />
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    )
                  })}
                </div>

                <p className="font-tech mt-6 border-t border-line-soft pt-4 text-[0.66rem] leading-relaxed tracking-[0.14em] text-mute/70">
                  {arsenalDisclaimer}
                </p>
              </div>

              {/* scan sheen */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true">
                <div className="absolute inset-x-0 h-24 animate-scanline bg-gradient-to-b from-transparent via-neon to-transparent" />
              </div>
            </div>
          </Reveal>

          {/* capability matrix */}
          <div className="lg:col-span-5">
            <Reveal delay={0.1} y={30}>
              <div className="relative border border-line-soft bg-card/40 p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-tech text-[0.66rem] tracking-[0.22em] text-mute">CAPABILITY MATRIX</span>
                  <Cpu size={12} className="text-neon/60" aria-hidden="true" />
                </div>

                <div className="space-y-4">
                  {arsenal.map((category) => {
                    const isActive = activeCat === category.id
                    const pct = Math.round((category.items.length / 6) * 100)
                    return (
                      <div key={category.id}>
                        <div className="mb-1.5 flex items-baseline justify-between gap-2">
                          <span
                            className={cn(
                              'font-tech text-[0.66rem] tracking-[0.18em] transition-colors duration-300',
                              isActive ? 'text-neon' : 'text-mute/80',
                            )}
                          >
                            {category.title}
                          </span>
                          <span className="font-tech text-[0.7rem] tracking-[0.16em] text-mute/70">
                            {String(category.items.length).padStart(2, '0')} TOOLS
                          </span>
                        </div>
                        <div className="h-[3px] w-full overflow-hidden bg-line">
                          <motion.div
                            className={cn(
                              'h-full origin-left transition-colors duration-500',
                              isActive ? 'bg-neon' : 'bg-emerald/50',
                            )}
                            initial={reduce ? false : { scaleX: 0 }}
                            whileInView={{ scaleX: pct / 100 }}
                            viewport={{ once: true, amount: 'some', margin: '160% 0px 15% 0px' }}
                            transition={{ duration: 1.2, ease: EASE_OUT_EXPO, delay: 0.1 }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-6 border-t border-line-soft pt-4">
                  <p className="font-tech text-[0.7rem] leading-relaxed tracking-[0.16em] text-mute/65">
                    BARS REFLECT CATEGORY WIDTH, NOT PROFICIENCY SCORES. EVERY OPERATIVE SPECIALISES DIFFERENTLY.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

function SkillTag({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={cn(
        'font-tech inline-flex items-center gap-1.5 border px-2 py-1 text-[0.66rem] tracking-[0.14em] transition-all duration-400',
        active
          ? 'border-neon/35 bg-neon/[0.06] text-neon'
          : 'border-line text-mute/80',
      )}
    >
      <span
        className={cn('h-[3px] w-[3px] transition-colors duration-400', active ? 'bg-neon' : 'bg-mute/50')}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}
