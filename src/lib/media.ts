/**
 * GHOST PROTOCOL // MEDIA HELPERS
 * ---------------------------------------------------------------
 * Every photograph is exported by `npm run optimize:images` into
 * /public/media as <name>-<width>.webp. These helpers build the
 * responsive src/srcset pairs from those files.
 */

export type MediaAsset = {
  /** Base file name without width suffix, e.g. "/media/operative-ghost". */
  base: string
  /** Available generated widths, ascending. */
  widths: readonly number[]
  /** Intrinsic aspect ratio (width / height) used to reserve layout space. */
  ratio: number
  /** Descriptive alt text — required for accessibility. */
  alt: string
}

export const MEDIA = {
  hero: {
    base: '/media/hero',
    widths: [960, 1600, 2200],
    ratio: 16 / 9,
    alt: 'A lone operative standing before a curved wall of emerald monitors in a dark command centre',
  },
  operativeGhost: {
    base: '/media/operative-ghost',
    widths: [420, 700, 1000],
    ratio: 4 / 5,
    alt: 'Anonymous hooded figure in black, centred against near-total darkness, face hidden in a black void with a green rim light',
  },
  operativeShadow: {
    base: '/media/operative-shadow',
    widths: [420, 700, 1000],
    ratio: 4 / 5,
    alt: 'Anonymous hooded figure in black seated beside a dark workstation, face unseen, lit by a faint green monitor glow',
  },
  operativePhantom: {
    base: '/media/operative-phantom',
    widths: [420, 700, 1000],
    ratio: 4 / 5,
    alt: 'Anonymous hooded silhouette turned at an angle, its outline doubled by motion echoes and traced by restrained green rim light',
  },
  operativeSpectre: {
    base: '/media/operative-spectre',
    widths: [420, 700, 1000],
    ratio: 4 / 5,
    alt: 'Anonymous hooded figure in black standing in a dark cyber operations room, face a black void, green interface light across the clothing',
  },
  operativeRogue: {
    base: '/media/operative-rogue',
    widths: [420, 700, 1000],
    ratio: 4 / 5,
    alt: 'Anonymous hooded figure in black framed from a low angle, face unseen, with fragments of green encrypted data drifting behind',
  },
  operativeCadet: {
    base: '/media/operative-cadet',
    widths: [420, 700, 1000],
    ratio: 4 / 5,
    alt: 'Anonymous hooded figure in black seen from behind, facing dim green intelligence maps and network graphs in a dark room',
  },
  missionZeroSecure: {
    base: '/media/mission-zerosecure',
    widths: [900, 1400, 1900],
    ratio: 3 / 2,
    alt: 'Stacked hexagonal circuit structures split by a single glowing green breach of light',
  },
  missionCyberEkathon: {
    base: '/media/mission-cyber-ekathon',
    widths: [900, 1400, 1900],
    ratio: 3 / 2,
    alt: 'A dark hall of glowing green workstations connected by long arcs of light',
  },
  missionBlackout: {
    base: '/media/mission-blackout',
    widths: [900, 1500, 2100],
    ratio: 16 / 7,
    alt: 'A blacked-out server corridor fading into darkness, with one distant slit of green light',
  },
  missionSecleaf: {
    base: '/media/mission-secleaf',
    widths: [900, 1500, 2100],
    ratio: 16 / 7,
    alt: 'A sealed manila mission file and encrypted drive on a dark briefing table, swept by a green scanner beam',
  },
} satisfies Record<string, MediaAsset>

export type MediaKey = keyof typeof MEDIA

export function imageSrc(asset: MediaAsset, width = asset.widths[asset.widths.length - 1]) {
  return `${asset.base}-${width}.webp`
}

export function imageSrcSet(asset: MediaAsset) {
  return asset.widths.map((w) => `${asset.base}-${w}.webp ${w}w`).join(', ')
}

/** Largest generated width — the safe fallback for `src`. */
export function imageFallback(asset: MediaAsset) {
  return imageSrc(asset, asset.widths[asset.widths.length - 1])
}
