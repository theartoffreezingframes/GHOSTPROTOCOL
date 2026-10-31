import { useCallback, useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

import { BootSequence, BOOT_STORAGE_KEY } from './components/BootSequence'
import { CommandPalette } from './components/CommandPalette'
import { CustomCursor } from './components/CustomCursor'
import { DossierProvider } from './components/DossierProvider'
import { EasterEggs } from './components/EasterEggs'
import { Footer } from './components/Footer'
import { Nav } from './components/Nav'
import { SectionTransitionOverlay, useSectionTransition } from './components/SectionTransition'
import { About } from './sections/About'
import { Arsenal } from './sections/Arsenal'
import { Contact } from './sections/Contact'
import { Hero } from './sections/Hero'
import { IdentityCards } from './components/IdentityCard'
import { Missions } from './sections/Missions'
import { NetworkMap } from './sections/NetworkMap'
import { Operatives } from './sections/Operatives'
import { Projects } from './sections/Projects'
import { RedactedFiles } from './sections/RedactedFiles'
import { Record } from './sections/Record'
import { SkillsMatrix } from './sections/SkillsMatrix'
import { SystemStatus } from './sections/SystemStatus'
import { ThreatRadar } from './sections/ThreatRadar'
import { Timeline } from './sections/Timeline'
import { Transmissions } from './sections/Transmissions'

function readBootFlag() {
  try {
    return window.sessionStorage.getItem(BOOT_STORAGE_KEY) === 'done'
  } catch {
    return false
  }
}

export default function App() {
  const reduce = useReducedMotion()
  const { play: playTransition, activeId, transition } = useSectionTransition()
  const [booted, setBooted] = useState(false)
  const [skipBoot, setSkipBoot] = useState(false)
  const [checked, setChecked] = useState(false)

  // Decide once, before paint of the site content, whether to boot.
  useEffect(() => {
    setSkipBoot(readBootFlag())
    setChecked(true)
  }, [])

  // Keep the page locked while the boot overlay is running.
  useEffect(() => {
    const shouldLock = checked && !booted && !skipBoot && !reduce
    document.body.classList.toggle('is-locked', shouldLock)
    return () => {
      if (shouldLock) document.body.classList.remove('is-locked')
    }
  }, [booted, checked, reduce, skipBoot])

  const finishBoot = useCallback(() => {
    try {
      window.sessionStorage.setItem(BOOT_STORAGE_KEY, 'done')
    } catch {
      /* private mode — fine, boot just replays next visit */
    }
    setBooted(true)
    document.body.classList.remove('is-locked')
  }, [])

  /**
   * Single easing owner for in-page navigation.
   *
   * The transition overlay is decoration laid over an already-started
   * scroll — it never gates navigation and adds no waiting time.
   */
  const navigate = useCallback(
    (id: string) => {
      playTransition(id)
      if (id === 'top') {
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
        return
      }
      const el = document.getElementById(id)
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY - 60
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
      // Keep keyboard focus in sync with the visual destination.
      el.setAttribute('tabindex', '-1')
      window.setTimeout(() => el.focus({ preventScroll: true }), reduce ? 0 : 700)
    },
    [playTransition, reduce],
  )

  const openMissions = useCallback(() => navigate('missions'), [navigate])

  const ready = checked && (booted || skipBoot || Boolean(reduce))

  return (
    <DossierProvider>
      <a
        href="#protocol"
        className="sr-only-focusable fixed left-4 top-4 z-[300] border border-neon bg-void px-4 py-2 font-tech text-[0.7rem] tracking-[0.2em] text-neon"
        onClick={(e) => {
          e.preventDefault()
          navigate('protocol')
        }}
      >
        SKIP TO CONTENT
      </a>

      <CustomCursor />

      {checked && (
        <BootSequence skipped={skipBoot} onComplete={finishBoot} />
      )}

      <SectionTransitionOverlay transition={transition} activeKey={activeId} />

      <Nav
        ready={ready}
        onNavigate={navigate}
        commandPalette={<CommandPalette onNavigate={navigate} onOpenMissions={openMissions} />}
      />

      <main id="main" className="relative">
        <Hero ready={ready} onNavigate={navigate} />
        <About />
        <Operatives />
        <NetworkMap />
        <SkillsMatrix />
        <Missions />
        <Transmissions />
        <Projects />
        <Arsenal />
        <ThreatRadar />
        <Timeline />
        <Record />
        <RedactedFiles />
        <IdentityCards />
        <SystemStatus />
        <Contact />
      </main>

      <Footer onNavigate={navigate} />
      <EasterEggs />
    </DossierProvider>
  )
}
