# GHOST PROTOCOL

**Independent cyber collective — official digital identity.**

A cinematic, single-page experience built like a classified command centre: terminal
boot sequence, digital rain, masked typography, operative dossiers, an archive of
completed operations and the encrypted file for the next one.

> WE ARE THE GHOSTS IN THE MACHINE.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into /dist
npm run preview  # serve the production build
```

Requires Node 20+.

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | React 19 + Vite 8 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) |
| Animation | Motion for React (`motion/react`) + a small set of CSS keyframes |
| Icons | Lucide React, plus official brand marks from `simple-icons` |
| Fonts | Self-hosted Space Grotesk / Inter / JetBrains Mono via Fontsource |

No backend. All content lives in typed data files.

---

## Where to edit content

Everything the site says comes from four files:

```
src/data/site.ts       brand copy, hero, boot log, contact channels, arsenal, record
src/data/team.ts       the three operatives (codenames, names, roles, profiles)
src/data/missions.ts   ZEROSECURE 2.0, CYBER EKATHON, BLACKOUT
src/data/projects.ts   engineering-lab bays (placeholders until real builds exist)
```

### Operatives — `src/data/team.ts`

Codenames, full names, designations and roles are official and must keep their spelling.
Each operative also exposes:

```ts
socials: []   // add { platform: 'github', href: 'https://…', label: 'GitHub' }
skills:  []   // add technologies the operative actually uses
image:   MEDIA.operativeGhost   // see "Images" below
```

Channels with an empty array stay hidden — no placeholder accounts are ever rendered.

### Operations — `src/data/missions.ts`

Statuses are fixed: `ZEROSECURE 2.0` and `CYBER EKATHON` are **COMPLETED**, `BLACKOUT`
is **UPCOMING**. Every narrative field (`summary`, `date`, `venue`, `dossier[].value`,
`outcomes`) is `null` until real details are available; the UI then prints an
`[ ENCRYPTED · AWAITING SUPPLY ]` marker instead of inventing anything.

Blackout's classified-file button is wired to a real reveal
(`MISSION DETAILS ENCRYPTED. / AWAITING AUTHORIZATION.`) — keep that copy until the
operation is declassified.

### Contact — `src/data/site.ts`

```ts
channels: [
  { key: 'github', label: 'GitHub', handle: null, href: null },
  …
]
```

Set `href` (and optionally `handle`) to publish a channel. Until then the row renders
as `SEALED` so nothing on the site implies a channel that does not exist.

---

## Images

Sources live in `src/assets/raw/` (git-ignored) and are exported to `public/media/` by:

```bash
npm run optimize:images
```

The script crops each photograph to the exact ratio its layout uses and emits WebP at
three widths alongside the favicon set and the Open Graph card. To swap a photograph,
replace the file in `src/assets/raw/` under the same name and re-run the script.

Responsive `src`/`srcset` pairs are generated in `src/lib/media.ts`.

---

## Architecture

```
src/
├── App.tsx                 page composition, boot gating, single scroll owner
├── components/             reusable primitives
│   ├── BootSequence.tsx    skippable terminal init (session-scoped)
│   ├── Nav.tsx             fixed header, active section, mobile sheet, progress
│   ├── Footer.tsx          oversized wordmark, directory, clock
│   ├── MaskedLines.tsx     headline line-mask reveal
│   ├── Reveal.tsx          scroll reveal wrapper
│   ├── GlitchText.tsx      RGB-split glitch type
│   ├── ScrambleText.tsx    decoding text effect
│   ├── DigitalRain.tsx     canvas matrix rain (24 fps, paused off-screen)
│   ├── CustomCursor.tsx    fine-pointer dot + lagging ring
│   ├── Magnetic.tsx        magnetic CTA pull
│   ├── Emblem.tsx          the Ghost Protocol mark (vector)
│   └── …
├── sections/               one file per numbered section
│   ├── Hero.tsx            (00) cinematic landing
│   ├── About.tsx           (01) the protocol
│   ├── Operatives.tsx      (02) operative database
│   ├── Missions.tsx        (03) classified operations
│   ├── Blackout.tsx        (03b) upcoming operation + classified file
│   ├── Projects.tsx        (04) engineering lab
│   ├── Arsenal.tsx         (05) technical arsenal
│   ├── Record.tsx          (06) record of operations
│   └── Contact.tsx         (07) establish connection
├── data/                   all editable content
├── lib/                    motion tokens, media helpers, utils
└── index.css               design tokens, component classes, keyframes
```

### Reveal animation gotcha (already handled)

A line translated below its `overflow-hidden` mask reports **zero** intersection with
`IntersectionObserver`, which would stall a scroll-triggered reveal forever. All masked
reveals therefore put the `whileInView` trigger on the *unclipped* wrapper and let the
inner line inherit variants (`MaskedLines`, `Blackout`). Keep that pattern when adding
new masked animations.

---

## Motion & accessibility

- `prefers-reduced-motion` is respected everywhere: the boot sequence is skipped, canvas
  rain renders a single static frame, magnetic/tilt/parallax effects switch off and
  reveals become simple opacity fades.
- The custom cursor only mounts for `pointer: fine` devices.
- Boot runs once per session (`sessionStorage.gp.boot.v1`) and can be skipped at any time
  with the on-screen control or `Esc`.
- Canvas and ambient CSS animations pause when the tab or section is off-screen.
- Semantic landmarks, labelled controls, visible focus rings, a skip link, and alt text on
  every photograph (decorative plates are `alt=""`).
- Sections carry `scroll-margin-top` so in-page anchors never hide under the fixed header.

---

## QA

```bash
node scripts/qa-content.mjs
```

Server-renders every section and asserts 120 content/markup requirements: official
identities, mission names and statuses, required copy, forbidden strings (including
`BIDBOSS`), no invented socials or achievements, image alt/lazy/dimension hygiene, and
SEO metadata.

---

## Content integrity rules

This build deliberately contains **no invented** photographs, qualifications,
certifications, awards, rankings, event dates, venues or objectives. Placeholders are
labelled as placeholders. When real details arrive, fill them in the data files and the
site will surface them — nothing else needs to change.
