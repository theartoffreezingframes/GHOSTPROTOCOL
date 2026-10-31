import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { Menu, X } from 'lucide-react'

import { brand, nav } from '../data/site'
import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'
import { Emblem } from './Emblem'

type NavProps = {
  /** Called with a section id — App owns the actual scroll so easing stays consistent. */
  onNavigate: (id: string) => void
  /** Hidden until the boot sequence releases the page. */
  ready: boolean
}

export function Nav({ onNavigate, ready }: NavProps) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<string>('')
  const sheetRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Track which section owns the viewport.
  useEffect(() => {
    const ids = nav.map((item) => item.id)
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.2, 0.6, 1] },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  // Lock the page while the mobile sheet is open, and keep keyboard
  // focus inside it — returning focus to the toggle on close.
  useEffect(() => {
    document.body.classList.toggle('is-locked', open)
    if (open) {
      const first = sheetRef.current?.querySelector<HTMLElement>('a, button')
      const id = window.setTimeout(() => first?.focus({ preventScroll: true }), 120)
      return () => window.clearTimeout(id)
    }
    if (sheetRef.current === null) toggleRef.current?.focus({ preventScroll: true })
    return () => document.body.classList.remove('is-locked')
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const go = (id: string) => {
    setOpen(false)
    onNavigate(id)
  }

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-[100]"
        initial={{ y: -80, opacity: 0 }}
        animate={ready ? { y: 0, opacity: 1 } : { y: -80, opacity: 0 }}
        transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: ready ? 0.15 : 0 }}
      >
        <div
          className={cn(
            'relative transition-colors duration-500',
            scrolled
              ? 'border-b border-line-soft bg-void/80 backdrop-blur-xl'
              : 'border-b border-transparent bg-transparent',
          )}
        >
          <div className="container-x flex h-[68px] items-center justify-between gap-6">
            {/* identity */}
            <button
              type="button"
              onClick={() => go('top')}
              className="group flex items-center gap-3 text-left"
              aria-label={`${brand.name} — back to top`}
            >
              <span className="relative h-8 w-8 shrink-0 transition-transform duration-500 group-hover:scale-105">
                <Emblem title="" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-bone">
                  {brand.nameParts[0]}
                  <span className="text-neon"> </span>
                  {brand.nameParts[1]}
                </span>
                <span className="font-tech mt-1 hidden text-[0.58rem] tracking-[0.22em] text-mute sm:block">
                  {brand.classification}
                </span>
              </span>
            </button>

            {/* desktop links */}
            <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
              {nav.map((item) => {
                const isActive = active === item.id
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      go(item.id)
                    }}
                    className={cn(
                      'group relative px-3 py-2 font-tech text-[0.6rem] tracking-[0.18em] transition-colors duration-300',
                      isActive ? 'text-neon' : 'text-mute hover:text-bone',
                    )}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    <span className="mr-1.5 text-[0.58rem] text-mute/60 group-hover:text-neon/70">{item.index}</span>
                    {item.short.toUpperCase()}
                    <span
                      className={cn(
                        'absolute inset-x-3 -bottom-0.5 h-px origin-left bg-neon transition-transform duration-500',
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                      )}
                      aria-hidden="true"
                    />
                  </a>
                )
              })}
            </nav>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => go('contact')}
                className="group hidden items-center gap-2 border border-line px-4 py-2.5 font-tech text-[0.58rem] tracking-[0.18em] text-bone transition-colors duration-300 hover:border-neon/60 hover:text-neon md:inline-flex"
              >
                <span className="h-1 w-1 rounded-full bg-neon animate-pulse-dot" aria-hidden="true" />
                ESTABLISH CONNECTION
              </button>

              <button
                ref={toggleRef}
                type="button"
                className="relative flex h-10 w-10 items-center justify-center border border-line text-bone transition-colors hover:border-neon/60 hover:text-neon lg:hidden"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? 'Close navigation' : 'Open navigation'}
              >
                {open ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {/* scroll progress */}
          <motion.div
            className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-neon via-emerald to-neon/0"
            style={{ scaleX: reduce ? 1 : progress, opacity: scrolled ? 1 : 0 }}
            aria-hidden="true"
          />
        </div>
      </motion.header>

      {/* mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={sheetRef}
            id="mobile-menu"
            className="fixed inset-0 z-[99] flex flex-col justify-between bg-void/97 px-6 pb-8 pt-24 backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
          >
            <nav className="flex flex-col" aria-label="Mobile">
              {nav.map((item, i) => (
                <motion.a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    go(item.id)
                  }}
                  className="group flex items-baseline gap-4 border-b border-line-soft py-4"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.06 * i }}
                >
                  <span className="font-tech w-7 text-[0.6rem] tracking-[0.2em] text-neon/70">{item.index}</span>
                  <span className="font-display text-[1.65rem] font-semibold uppercase leading-none text-bone transition-colors group-hover:text-neon">
                    {item.label}
                  </span>
                  <span className="ml-auto text-mute transition-transform duration-300 group-hover:translate-x-1 group-hover:text-neon">
                    →
                  </span>
                </motion.a>
              ))}
            </nav>

            <motion.div
              className="flex flex-col gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <button type="button" className="btn btn-primary w-full" onClick={() => go('contact')}>
                ESTABLISH CONNECTION
              </button>
              <p className="font-tech text-center text-[0.6rem] tracking-[0.2em] text-mute/70">
                {brand.name} // {brand.classification}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
