import { useEffect, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

import { initAudio, isAudioEnabled, onAudioChange, setAudioEnabled } from '../lib/audio'
import { cn } from '../lib/utils'

/**
 * Audio is OFF until the visitor turns it on — nothing autoplays, and the
 * AudioContext is only constructed inside this click handler, which keeps
 * us inside every browser's autoplay policy.
 */
export function AudioToggle({ className }: { className?: string }) {
  const [on, setOn] = useState(false)

  useEffect(() => {
    initAudio()
    setOn(isAudioEnabled())
    return onAudioChange(setOn)
  }, [])

  return (
    <button
      type="button"
      onClick={() => void setAudioEnabled(!on)}
      aria-pressed={on}
      aria-label={on ? 'Mute interface sound' : 'Enable interface sound'}
      title={on ? 'Sound on — click to mute' : 'Sound off — click to enable'}
      className={cn(
        'group flex items-center gap-2 border px-2.5 py-2 font-tech text-[0.6rem] tracking-[0.18em] transition-colors duration-300',
        on ? 'border-neon/40 text-neon' : 'border-line text-mute hover:border-neon/40 hover:text-bone',
        className,
      )}
    >
      {on ? (
        <Volume2 size={12} aria-hidden="true" />
      ) : (
        <VolumeX size={12} className="opacity-70" aria-hidden="true" />
      )}
      <span className="hidden sm:inline">{on ? 'SOUND ON' : 'SOUND OFF'}</span>
    </button>
  )
}
