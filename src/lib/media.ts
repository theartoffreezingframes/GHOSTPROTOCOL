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
    widths: [640, 1000, 1400],
    ratio: 4 / 5,
    alt: 'Anonymous hooded silhouette outlined by a thin neon-green rim light on a black background',
  },
  operativeShadow: {
    base: '/media/operative-shadow',
    widths: [640, 1000, 1400],
    ratio: 4 / 5,
    alt: 'Anonymous hooded figure at a dark workstation, face hidden in shadow with green circuit light',
  },
  operativePhantom: {
    base: '/media/operative-phantom',
    widths: [640, 1000, 1400],
    ratio: 4 / 5,
    alt: 'Anonymous figure in profile dissolving into black mist with a faint ghosted double exposure',
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
