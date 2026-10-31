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
    alt: 'Lead operative GHOST in a dark command centre, face half in shadow with green intelligence displays behind him',
  },
  operativeShadow: {
    base: '/media/operative-shadow',
    widths: [420, 700, 1000],
    ratio: 4 / 5,
    alt: 'Technical specialist SHADOW lit by neon green, sitting at a dark workstation with encrypted code interfaces behind him',
  },
  operativePhantom: {
    base: '/media/operative-phantom',
    widths: [420, 700, 1000],
    ratio: 4 / 5,
    alt: 'Stealth operative PHANTOM in profile in a dark concrete corridor, one band of green light across the face',
  },
  operativeSpectre: {
    base: '/media/operative-spectre',
    widths: [420, 700, 1000],
    ratio: 4 / 5,
    alt: 'Adaptable technical specialist SPECTRE in a cyber operations room, layered green holographic interfaces behind him',
  },
  operativeCipher: {
    base: '/media/operative-cipher',
    widths: [420, 700, 1000],
    ratio: 4 / 5,
    alt: 'Emerging operative CIPHER emerging from darkness, lit by green light with soft encrypted glyphs drifting behind',
  },
  operativeMaverick: {
    base: '/media/operative-maverick',
    widths: [420, 700, 1000],
    ratio: 4 / 5,
    alt: 'Intelligence analyst MAVERICK in front of holographic data maps and network graphs in a dark analysis room',
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
