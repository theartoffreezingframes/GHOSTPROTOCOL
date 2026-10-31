/**
 * ═══════════════════════════════════════════════════════════════
 * GHOST PROTOCOL // ENGINEERING LAB
 * ═══════════════════════════════════════════════════════════════
 * Placeholders only — no completed project is claimed.
 *
 * TO ADD A REAL PROJECT:
 *  1. Drop an image in /src/assets/raw, add it to src/lib/media.ts
 *     and to the job list in scripts/optimize-images.mjs, then run
 *     `npm run optimize:images`.
 *  2. Set `image` to that asset.
 *  3. Fill `problem`, `solution`, `stack`, `repo`, `demo`, `year`.
 *
 * A slot with `status: 'SLOT OPEN'` renders as an empty lab bay.
 */

export type ProjectStatus = 'SLOT OPEN' | 'IN DEVELOPMENT' | 'SHIPPED'

export type Project = {
  id: string
  index: string
  name: string
  status: ProjectStatus
  year: string | null
  summary: string | null
  problem: string | null
  solution: string | null
  stack: string[]
  imageKey: 'missionZeroSecure' | 'missionCyberEkathon' | null
  repo: string | null
  demo: string | null
}

export const projects: Project[] = [
  {
    id: 'lab-01',
    index: '01',
    name: 'PROJECT SLOT 01',
    status: 'SLOT OPEN',
    year: null,
    summary: null,
    problem: null,
    solution: null,
    stack: [],
    imageKey: null,
    repo: null,
    demo: null,
  },
  {
    id: 'lab-02',
    index: '02',
    name: 'PROJECT SLOT 02',
    status: 'SLOT OPEN',
    year: null,
    summary: null,
    problem: null,
    solution: null,
    stack: [],
    imageKey: null,
    repo: null,
    demo: null,
  },
  {
    id: 'lab-03',
    index: '03',
    name: 'PROJECT SLOT 03',
    status: 'SLOT OPEN',
    year: null,
    summary: null,
    problem: null,
    solution: null,
    stack: [],
    imageKey: null,
    repo: null,
    demo: null,
  },
]

export const labMeta = {
  index: '04',
  label: 'ENGINEERING LAB',
  heading: ['IDEAS INTO', 'EXECUTION.'],
  intro:
    'The lab is where protocol theory becomes working software. Bays are listed openly — a build only appears once it exists.',
  emptyLabel: 'AWAITING DEPLOYMENT',
  emptyNote: 'No public project has been declassified yet.',
}
