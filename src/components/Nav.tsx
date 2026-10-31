import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { ChevronDown, Menu, X } from 'lucide-react'

import { brand, nav, primaryNav, secondaryNav } from '../data/site'
import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'
import { Emblem } from './Emblem'
import { AudioToggle } from './AudioToggle'

type NavProps = {
  /** Called with a section id — App owns the actual scroll so easing stays consistent. */
  onNavigate: (id: string) => void
  /** Hidden until the boot sequence releases the page. */
  ready: boolean
  /** The command palette (trigger + dialog), owned by App so it can navigate. */
  commandPalette?: ReactNode
}

export function Nav({ onNavigate, ready, commandPalette }: NavProps) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<string>('')
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)
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
      if (e.key === 'Escape') {
        setOpen(false)
        setMoreOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Dismiss the overflow menu on an outside pointer press.
  useEffect(() => {
    if (!moreOpen) return
    const onDown = (event: PointerEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) setMoreOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [moreOpen])

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
              <span className="flex min-w-0 flex-col leading-none">
                <span className="font-display truncate text-[0.82rem] font-medium uppercase tracking-[0.16em] text-bone">
                  {brand.nameParts[0]}
                  <span className="text-neon"> </span>
                  {brand.nameParts[1]}
                </span>
                <span className="font-tech mt-1 hidden text-[0.6rem] tracking-[0.2em] text-mute xl:block">
                  {brand.classification}
                </span>
              </span>
            </button>

            {/* desktop links */}
            <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
              {primaryNav.map((item) => {
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
                      'group relative px-1.5 py-2 font-tech text-[0.6rem] tracking-[0.1em] transition-colors duration-300 xl:px-2.5 xl:text-[0.66rem] xl:tracking-[0.14em]',
                      isActive ? 'text-neon' : 'text-mute hover:text-bone',
                    )}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    <span className="mr-1 hidden text-[0.55rem] text-mute/75 group-hover:text-neon/70 xl:mr-1.5 xl:inline">
                      {item.index}
                    </span>
                    {item.short.toUpperCase()}
                    <span
                      className={cn(
                        'absolute inset-x-2 -bottom-0.5 h-px origin-left bg-neon transition-transform duration-500 xl:inset-x-3',
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                      )}
                      aria-hidden="true"
                    />
                  </a>
                )
              })}

              {/* overflow — 12 sections cannot fit in one row without
                  pushing the identity and CTA off screen */}
              <div ref={moreRef} className="relative hidden lg:block">
                <button
                  type="button"
                  onClick={() => setMoreOpen((value) => !value)}
                  aria-expanded={moreOpen}
                  {...(moreOpen ? { 'aria-controls': 'more-sections' } : {})}
                  className={cn(
                    'group relative flex items-center gap-1 px-1.5 py-2 font-tech text-[0.6rem] tracking-[0.1em] transition-colors duration-300 xl:gap-1.5 xl:px-2 xl:text-[0.66rem] xl:tracking-[0.13em]',
                    secondaryNav.some((item) => item.id === active)
                      ? 'text-neon'
                      : 'text-mute hover:text-bone',
                  )}
                >
                  SECTIONS
                  <ChevronDown
                    size={10}
                    className={cn('transition-transform duration-300', moreOpen && 'rotate-180')}
                    aria-hidden="true"
                  />
                  <span
                    className={cn(
                      'absolute inset-x-2 -bottom-0.5 h-px origin-left bg-neon transition-transform duration-500 xl:inset-x-3',
                      secondaryNav.some((item) => item.id === active) ? 'scale-x-100' : 'scale-x-0',
                    )}
                    aria-hidden="true"
                  />
                </button>

                <AnimatePresence>
                  {moreOpen && (
                    <motion.div
                      id="more-sections"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: reduce ? 0 : 0.28, ease: EASE_OUT_EXPO }}
                      className="absolute right-0 top-full mt-2 w-64 border border-line-soft bg-void/97 p-1.5 backdrop-blur-xl"
                    >
                      {secondaryNav.map((item) => {
                        const isActive = active === item.id
                        return (
                          <a
                            key={item.id}
                            href={`#${item.id}`}
                            onClick={(e) => {
                              e.preventDefault()
                              setMoreOpen(false)
                              go(item.id)
                            }}
                            className={cn(
                              'flex items-baseline gap-3 px-2.5 py-2 font-tech text-[0.62rem] tracking-[0.14em] transition-colors',
                              isActive ? 'bg-neon/[0.06] text-neon' : 'text-mute hover:bg-white/[0.03] hover:text-bone',
                            )}
                            aria-current={isActive ? 'true' : undefined}
                          >
                            <span className="text-[0.55rem] text-mute/50">{item.index}</span>
                            {item.label.toUpperCase()}
                          </a>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            <div className="flex items-center gap-2">
              {commandPalette}

              <AudioToggle className="hidden sm:flex" />

              <button
                type="button"
                onClick={() => go('contact')}
                className="group hidden items-center gap-2 whitespace-nowrap border border-line px-2.5 py-2.5 font-tech text-[0.6rem] tracking-[0.14em] text-bone transition-colors duration-300 hover:border-neon/60 hover:text-neon xl:inline-flex"
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
                {...(open ? { 'aria-controls': 'mobile-menu' } : {})}
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
                  <span className="font-tech w-7 text-[0.7rem] tracking-[0.2em] text-neon/70">{item.index}</span>
                  <span className="font-display text-[1.65rem] font-medium uppercase leading-none text-bone transition-colors group-hover:text-neon">
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
              <p className="font-tech text-center text-[0.7rem] tracking-[0.2em] text-mute/70">
                {brand.name} // {brand.classification}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
