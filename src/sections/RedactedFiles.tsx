import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { FileLock2, LockOpen, ScanLine } from 'lucide-react'

import { intelligenceFiles, redactionCopy, type IntelligenceFile } from '../data/intel'
import { EASE_OUT_EXPO } from '../lib/motion'
import { cn } from '../lib/utils'
import { playSound } from '../lib/audio'
import { SectionHeading } from '../components/SectionHeading'
import { Reveal } from '../components/Reveal'

/**
 * REDACTED INTELLIGENCE FILES
 * Every document, reference and revealed string is invented for this
 * site. No credential, key or personal datum exists anywhere in here.
 */
export function RedactedFiles() {
  return (
    <section
      id="intel"
      aria-labelledby="intel-heading"
      className="relative overflow-hidden border-t border-line-soft bg-void py-24 sm:py-32 lg:py-40"
    >
      <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden="true">
        <div className="absolute inset-0 noise-overlay opacity-[0.18] mix-blend-soft-light" />
        <div className="absolute right-0 bottom-0 h-[26rem] w-[min(34rem,90vw)] rounded-full bg-emerald/[0.04] blur-[120px]" />
      </div>

      <div className="container-x relative z-10">
        <SectionHeading
          id="intel-heading"
          index="07.5"
          label={redactionCopy.label}
          lines={redactionCopy.heading}
          aside={
            <span className="font-tech ml-auto hidden items-center gap-2 text-[0.7rem] tracking-[0.22em] text-mute/70 md:flex">
              <FileLock2 size={9} aria-hidden="true" />
              {String(intelligenceFiles.length).padStart(2, '0')} FILES // PARTIAL
            </span>
          }
        >
          <Reveal delay={0.2}>
            <p className="text-[0.95rem] leading-relaxed text-mute">{redactionCopy.support}</p>
          </Reveal>
        </SectionHeading>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:mt-16 lg:grid-cols-3">
          {intelligenceFiles.map((file, index) => (
            <FileCard key={file.id} file={file} index={index} />
          ))}
        </div>

        <Reveal delay={0.1} className="mt-5">
          <p className="font-tech flex items-start gap-2 border-l border-line px-3 text-[0.55rem] leading-relaxed tracking-[0.14em] text-mute/50">
            <ScanLine size={10} className="mt-0.5 shrink-0 text-neon/40" aria-hidden="true" />
            {redactionCopy.notice}
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function FileCard({ file, index }: { file: IntelligenceFile; index: number }) {
  const reduce = useReducedMotion()
  const [revealed, setRevealed] = useState<string[]>([])
  const [expanded, setExpanded] = useState(false)

  const revealOne = (id: string) => {
    playSound('terminal')
    setRevealed((current) => (current.includes(id) ? current : [...current, id]))
  }

  const allRevealed = revealed.length === file.redactions.length
  const detailsId = `${file.id}-details`

  return (
    <motion.article
      className="group relative flex flex-col border border-line-soft bg-card/40 transition-colors duration-500 hover:border-neon/25"
      initial={reduce ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 'some', margin: '160% 0px 15% 0px' }}
      transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: index * 0.08 }}
    >
      {/* document header */}
      <div className="flex items-center justify-between border-b border-line-soft px-4 py-2.5">
        <span className="font-tech text-[0.55rem] tracking-[0.2em] text-neon/80">{file.reference}</span>
        <span className="font-tech flex items-center gap-1.5 text-[0.48rem] tracking-[0.14em] text-mute/50">
          <ScanLine size={8} aria-hidden="true" />
          {allRevealed ? 'DECLASSIFIED' : 'PARTIAL'}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-[1.05rem] font-medium uppercase leading-tight tracking-[-0.01em] text-bone">
          {file.title}
        </h3>
        <p className="font-tech mt-1.5 text-[0.52rem] tracking-[0.16em] text-mute/60">{file.classification}</p>
        <p className="font-tech mt-0.5 text-[0.52rem] tracking-[0.16em] text-emerald/70">{file.clearance}</p>

        <p className="mt-3 text-[0.8rem] leading-relaxed text-mute">{file.summary}</p>

        {/* document body with redaction bars */}
        <div className="mt-4 space-y-2 border-t border-line-soft pt-3">
          {file.redactions.map((redaction) => {
            const open = revealed.includes(redaction.id)
            return (
              <div key={redaction.id} className="min-h-[1.6rem]">
                <AnimatePresence mode="wait" initial={false}>
                  {open ? (
                    <motion.p
                      key="open"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: reduce ? 0 : 0.35 }}
                      className="font-tech text-[0.55rem] leading-snug tracking-[0.12em] text-neon/80"
                    >
                      {redaction.reveal}
                    </motion.p>
                  ) : (
                    <motion.button
                      key="sealed"
                      type="button"
                      onClick={() => revealOne(redaction.id)}
                      aria-label={`Reveal redacted line in ${file.title}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group/bar flex h-[1.1rem] w-full items-center overflow-hidden border border-white/[0.07] bg-[#030504] transition-colors hover:border-neon/50"
                      style={{ width: `${redaction.width}%` }}
                    >
                      <span className="sr-only">REDACTED — activate to reveal</span>
                      <span
                        aria-hidden="true"
                        className="h-full w-full bg-[repeating-linear-gradient(90deg,rgba(57,255,20,0.10)_0,rgba(57,255,20,0.10)_1px,transparent_1px,transparent_6px)] opacity-70 transition-opacity group-hover/bar:opacity-100"
                      />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* expandable preview */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              id={detailsId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.45, ease: EASE_OUT_EXPO }}
              className="overflow-hidden"
            >
              <dl className="mt-3 space-y-1.5 border-t border-line-soft pt-3">
                <Row label="REFERENCE" value={file.reference} />
                <Row label="CLASSIFICATION" value={file.classification} />
                <Row label="CLEARANCE" value={file.clearance} />
                <Row label="FILE STATUS" value={allRevealed ? 'DECLASSIFIED' : file.status} />
                <Row label="ISSUED" value={file.issued ?? 'DATE UNDISCLOSED'} muted />
              </dl>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                playSound('confirm')
                setRevealed(allRevealed ? [] : file.redactions.map((r) => r.id))
              }}
              className="font-tech flex items-center gap-1.5 border border-line-soft px-2 py-1.5 text-[0.52rem] tracking-[0.16em] text-mute/70 transition-colors hover:border-neon/40 hover:text-neon"
            >
              {allRevealed ? <FileLock2 size={9} aria-hidden="true" /> : <LockOpen size={9} aria-hidden="true" />}
              {allRevealed ? redactionCopy.resealAll : redactionCopy.revealAll}
            </button>
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              {...(expanded ? { 'aria-controls': detailsId } : {})}
              className="font-tech border border-line-soft px-2 py-1.5 text-[0.52rem] tracking-[0.16em] text-mute/70 transition-colors hover:border-neon/40 hover:text-neon"
            >
              {expanded ? 'COLLAPSE FILE' : 'FILE DETAILS'}
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="font-tech shrink-0 text-[0.5rem] tracking-[0.16em] text-mute/50">{label}</dt>
      <dd
        className={cn(
          'font-tech text-right text-[0.52rem] tracking-[0.12em]',
          muted ? 'text-mute/45' : 'text-bone/80',
        )}
      >
        {value}
      </dd>
    </div>
  )
}
