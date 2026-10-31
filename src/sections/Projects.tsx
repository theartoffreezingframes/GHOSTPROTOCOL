import { useId, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronDown, FlaskConical, GitBranch, RadioTower, SquareArrowOutUpRight } from 'lucide-react'

import { labMeta, projects, type Project } from '../data/projects'
import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { StatusPill } from '../components/StatusPill'
import { Emblem } from '../components/Emblem'

export function Projects() {
  return (
    <section
      id="lab"
      aria-labelledby="lab-heading"
      className="relative overflow-hidden border-t border-line-soft bg-void py-24 sm:py-32 lg:py-40"
    >
      <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden="true">
        <div className="absolute inset-0 grid-bg opacity-30 [mask-image:linear-gradient(to_bottom,#000,transparent_70%)]" />
        <div className="absolute -left-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-emerald/[0.05] blur-[120px]" />
      </div>

      <div className="container-x relative z-10">
        <SectionHeading
          id="lab-heading"
          index={labMeta.index}
          label={labMeta.label}
          lines={labMeta.heading}
          aside={
            <span className="font-tech ml-auto hidden items-center gap-2 text-[0.7rem] tracking-[0.22em] text-mute/70 md:flex">
              <FlaskConical size={9} aria-hidden="true" />
              BAYS // 03 OPEN
            </span>
          }
        >
          <Reveal delay={0.2}>
            <p className="text-[0.95rem] leading-relaxed text-mute">{labMeta.intro}</p>
          </Reveal>
        </SectionHeading>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:mt-20 lg:grid-cols-12 lg:gap-6">
          {/* feature panel */}
          <Reveal className="lg:col-span-5" y={36}>
            <div className="relative flex h-full min-h-[22rem] flex-col justify-between overflow-hidden border border-line-soft bg-card/50 p-6 sm:p-8">
              <div className="absolute inset-0 grid-bg opacity-40" aria-hidden="true" />
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-30 blur-[70px]"
                style={{ background: 'radial-gradient(circle,#39FF14,transparent 70%)' }}
                aria-hidden="true"
              />
              {/* blueprint grid crosshairs */}
              <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                {[18, 46, 74].map((pos) => (
                  <div key={pos} className="absolute inset-x-0 h-px bg-line-soft" style={{ top: `${pos}%` }} />
                ))}
                {[26, 62].map((pos) => (
                  <div key={pos} className="absolute inset-y-0 w-px bg-line-soft" style={{ left: `${pos}%` }} />
                ))}
              </div>

              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="font-tech text-[0.7rem] tracking-[0.24em] text-neon/90">LAB STATUS</p>
                  <p className="font-tech mt-1 text-[0.7rem] tracking-[0.2em] text-mute">BAYS ARE OPEN</p>
                </div>
                <FlaskConical size={16} className="text-neon/60" aria-hidden="true" />
              </div>

              <div className="relative z-10 my-8 flex justify-center">
                <div className="h-28 w-28 opacity-90 sm:h-32 sm:w-32">
                  <Emblem animated title="Ghost Protocol lab emblem" />
                </div>
              </div>

              <div className="relative z-10">
                <p className="font-display text-[1.6rem] font-medium uppercase leading-none tracking-[-0.03em] text-bone sm:text-[1.9rem]">
                  {labMeta.emptyLabel}
                </p>
                <p className="mt-3 max-w-xs text-[0.85rem] leading-relaxed text-mute">{labMeta.emptyNote}</p>
                <div className="mt-5 flex items-center gap-2 border-t border-line-soft pt-4">
                  <RadioTower size={11} className="text-neon/60" aria-hidden="true" />
                  <span className="font-tech text-[0.7rem] tracking-[0.18em] text-mute/75">
                    BUILDS PUBLISH AFTER VERIFICATION
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* project bays */}
          <div className="lg:col-span-7">
            <div className="flex flex-col gap-3">
              {projects.map((project, index) => (
                <ProjectBay key={project.id} project={project} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProjectBay({ project, index }: { project: Project; index: number }) {
  const [open, setOpen] = useState(index === 0)
  const reduce = useReducedMotion()
  const id = useId()
  const hasContent = Boolean(project.summary || project.problem || project.solution)

  return (
    <motion.div
      className="group relative overflow-hidden border border-line-soft bg-card/40 transition-colors duration-500 hover:border-neon/25"
      initial={reduce ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 'some', margin: '160% 0px 15% 0px' }}
      transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: index * 0.1 }}
    >
      {/* hover edge */}
      <div className="absolute left-0 top-0 h-full w-px origin-top scale-y-0 bg-neon/60 transition-transform duration-700 group-hover:scale-y-100" aria-hidden="true" />

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        {...(open ? { 'aria-controls': `${id}-body` } : {})}
        className="flex w-full items-center gap-4 px-4 py-4 text-left sm:px-5"
      >
        <span className="font-tech w-6 shrink-0 text-[0.7rem] tracking-[0.18em] text-neon/60">
          {project.index}
        </span>
        <span className="min-w-0 flex-1">
          <span className="font-display block truncate text-[1.15rem] font-medium uppercase leading-none tracking-[-0.02em] text-bone transition-colors duration-500 group-hover:text-neon sm:text-[1.35rem]">
            {project.name}
          </span>
          <span className="font-tech mt-2 block text-[0.66rem] tracking-[0.2em] text-mute/75">
            {hasContent ? (project.year ?? 'UNRELEASED') : 'UNASSIGNED BAY'}
          </span>
        </span>
        <StatusPill tone={hasContent ? 'online' : 'muted'} className="hidden shrink-0 sm:inline-flex">
          {project.status}
        </StatusPill>
        <ChevronDown
          size={14}
          className={cn('shrink-0 text-mute transition-transform duration-500', open && 'rotate-180 text-neon')}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-body`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-5 border-t border-line-soft px-4 pb-5 pt-5 sm:grid-cols-2 sm:px-5">
              <div className="sm:col-span-2">
                <BayLabel>SUMMARY</BayLabel>
                <p
                  className={cn(
                    'mt-1.5 text-[0.85rem] leading-relaxed',
                    project.summary ? 'text-bone/85' : 'font-tech text-[0.66rem] tracking-[0.18em] text-mute/65',
                  )}
                >
                  {project.summary ?? '[ PLACEHOLDER · AWAITING PROJECT BRIEF ]'}
                </p>
              </div>

              <div>
                <BayLabel>PROBLEM STATEMENT</BayLabel>
                <p className="mt-1.5 font-tech text-[0.66rem] tracking-[0.18em] text-mute/65">
                  {project.problem ?? '[ NOT DECLASSIFIED ]'}
                </p>
              </div>

              <div>
                <BayLabel>SOLUTION</BayLabel>
                <p className="mt-1.5 font-tech text-[0.66rem] tracking-[0.18em] text-mute/65">
                  {project.solution ?? '[ NOT DECLASSIFIED ]'}
                </p>
              </div>

              <div>
                <BayLabel>STACK</BayLabel>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {project.stack.length > 0 ? (
                    project.stack.map((tech) => (
                      <StatusPill key={tech} tone="muted">
                        {tech}
                      </StatusPill>
                    ))
                  ) : (
                    <span className="font-tech text-[0.66rem] tracking-[0.18em] text-mute/65">[ UNLISTED ]</span>
                  )}
                </div>
              </div>

              <div>
                <BayLabel>ACCESS</BayLabel>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <LinkSlot
                    label="REPOSITORY"
                    href={project.repo}
                    icon={<GitBranch size={10} aria-hidden="true" />}
                  />
                  <LinkSlot
                    label="LIVE DEMO"
                    href={project.demo}
                    icon={<SquareArrowOutUpRight size={10} aria-hidden="true" />}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* subtle reveal bar */}
      {!reduce && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-neon/0 via-neon/30 to-neon/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true" />
      )}
    </motion.div>
  )
}

function BayLabel({ children }: { children: string }) {
  return <p className="font-tech text-[0.66rem] tracking-[0.22em] text-neon/70">{children}</p>
}

function LinkSlot({ label, href, icon }: { label: string; href: string | null; icon: React.ReactNode }) {
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-tech inline-flex items-center gap-1.5 border border-neon/30 px-2 py-1 text-[0.66rem] tracking-[0.16em] text-neon transition-colors hover:bg-neon/10"
      >
        {icon}
        {label}
      </a>
    )
  }
  return (
    <span className="font-tech inline-flex items-center gap-1.5 border border-line px-2 py-1 text-[0.66rem] tracking-[0.16em] text-mute/65">
      {icon}
      {label} · NONE
    </span>
  )
}
