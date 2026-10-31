/**
 * ═══════════════════════════════════════════════════════════════
 * GHOST PROTOCOL // SYNTHESISED INTERFACE AUDIO
 * ═══════════════════════════════════════════════════════════════
 * Every sound is generated at runtime with the Web Audio API — there
 * are no audio files in this project, so there is nothing to licence
 * and nothing that can 404. Nothing autoplays: the AudioContext is
 * only created after a deliberate user gesture on the sound control.
 *
 * Opt-in by design. The default is silent, and the preference is
 * remembered in localStorage.
 */

export type SoundName =
  | 'terminal'
  | 'scan'
  | 'transmission'
  | 'confirm'
  | 'dossier'
  | 'alert'
  | 'access'

const STORAGE_KEY = 'gp.audio.v1'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let enabled = false
let listeners = new Set<(on: boolean) => void>()

function readPreference(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'on'
  } catch {
    return false
  }
}

function writePreference(on: boolean) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off')
  } catch {
    /* private mode — the toggle still works for this session */
  }
}

/** Lazily build the graph. Must be called from a user gesture. */
function graph(): { ctx: AudioContext; master: GainNode } | null {
  if (typeof window === 'undefined') return null
  if (ctx && master) return { ctx, master }
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  ctx = new Ctor()
  master = ctx.createGain()
  // Deliberately quiet — atmosphere, never a soundtrack.
  master.gain.value = 0.085
  master.connect(ctx.destination)
  return { ctx, master }
}

/** Short tone with an exponential tail. */
function tone(
  c: AudioContext,
  out: GainNode,
  {
    freq,
    endFreq,
    start,
    duration,
    gain = 1,
    type = 'sine',
  }: { freq: number; endFreq?: number; start: number; duration: number; gain?: number; type?: OscillatorType },
) {
  const osc = c.createOscillator()
  const env = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, c.currentTime + start)
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, c.currentTime + start + duration)
  env.gain.setValueAtTime(0.0001, c.currentTime + start)
  env.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + 0.012)
  env.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + duration)
  osc.connect(env)
  env.connect(out)
  osc.start(c.currentTime + start)
  osc.stop(c.currentTime + start + duration + 0.05)
}

/** Filtered noise burst — terminal hiss / scanning texture. */
function noise(
  c: AudioContext,
  out: GainNode,
  { start, duration, gain = 0.5, freq = 1400 }: { start: number; duration: number; gain?: number; freq?: number },
) {
  const frames = Math.max(1, Math.floor(c.sampleRate * duration))
  const buffer = c.createBuffer(1, frames, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < frames; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
  }
  const src = c.createBufferSource()
  src.buffer = buffer
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = freq
  filter.Q.value = 1.4
  const env = c.createGain()
  env.gain.value = gain
  src.connect(filter)
  filter.connect(env)
  env.connect(out)
  src.start(c.currentTime + start)
}

const RECIPES: Record<SoundName, (c: AudioContext, out: GainNode) => void> = {
  terminal: (c, out) => {
    tone(c, out, { freq: 520, endFreq: 660, start: 0, duration: 0.09, type: 'square', gain: 0.28 })
    noise(c, out, { start: 0, duration: 0.05, gain: 0.12, freq: 2400 })
  },
  scan: (c, out) => {
    tone(c, out, { freq: 300, endFreq: 900, start: 0, duration: 0.5, gain: 0.2, type: 'sine' })
  },
  transmission: (c, out) => {
    noise(c, out, { start: 0, duration: 0.22, gain: 0.3, freq: 1800 })
    tone(c, out, { freq: 880, start: 0.04, duration: 0.12, gain: 0.16, type: 'square' })
    tone(c, out, { freq: 1180, start: 0.16, duration: 0.12, gain: 0.13, type: 'square' })
  },
  confirm: (c, out) => {
    tone(c, out, { freq: 700, start: 0, duration: 0.1, gain: 0.3 })
    tone(c, out, { freq: 1050, start: 0.07, duration: 0.14, gain: 0.22 })
  },
  dossier: (c, out) => {
    noise(c, out, { start: 0, duration: 0.3, gain: 0.22, freq: 900 })
    tone(c, out, { freq: 420, endFreq: 300, start: 0.02, duration: 0.45, gain: 0.18 })
    tone(c, out, { freq: 640, start: 0.28, duration: 0.18, gain: 0.14 })
  },
  alert: (c, out) => {
    tone(c, out, { freq: 380, start: 0, duration: 0.18, gain: 0.28, type: 'triangle' })
    tone(c, out, { freq: 380, start: 0.22, duration: 0.18, gain: 0.24, type: 'triangle' })
  },
  access: (c, out) => {
    tone(c, out, { freq: 240, endFreq: 760, start: 0, duration: 0.7, gain: 0.2 })
    noise(c, out, { start: 0.35, duration: 0.4, gain: 0.14, freq: 1600 })
  },
}

export function isAudioEnabled() {
  return enabled
}

/** Called once on mount — restores the saved preference without playing anything. */
export function initAudio() {
  if (typeof window === 'undefined') return
  enabled = readPreference()
}

export function onAudioChange(fn: (on: boolean) => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

/** Must be wired to a real click. Resumes the context if the browser suspended it. */
export async function setAudioEnabled(on: boolean) {
  enabled = on
  writePreference(on)
  if (on) {
    const g = graph()
    if (g && g.ctx.state === 'suspended') {
      try {
        await g.ctx.resume()
      } catch {
        /* the browser refused — stay silent rather than throw */
      }
    }
    if (g) RECIPES.confirm(g.ctx, g.master)
  }
  listeners.forEach((fn) => fn(on))
}

/** Fire-and-forget. Silent no-op whenever audio is off or unavailable. */
export function playSound(name: SoundName) {
  if (!enabled) return
  const g = graph()
  if (!g || g.ctx.state !== 'running') return
  try {
    RECIPES[name](g.ctx, g.master)
  } catch {
    /* never let a decorative sound break an interaction */
  }
}
