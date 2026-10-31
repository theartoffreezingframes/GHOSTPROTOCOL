# GHOST PROTOCOL

**Independent cyber collective — official digital identity.**

A cinematic single-page experience built like a classified command centre: a terminal
boot sequence, digital rain, masked typography, operative dossiers, an archive of
completed operations, and an encrypted file for the next one.

> WE ARE THE GHOSTS IN THE MACHINE.

---

## Overview

Ghost Protocol is a six-person cyber collective. This site is their public identity:
who operates, what has been executed, what is live right now, and how to open a channel.
It is a fully interactive React application — every button, dossier, mission record and
navigation control works. There is no backend; all content is typed, local data.

**Design language:** cyberpunk + cinematic + dark luxury. Near-black plates, a single
neon accent, oversized display type, technical HUD chrome, restrained motion.

---

## Features

**Sections**

| # | Section | Notes |
| --- | --- | --- |
| — | Boot sequence | Terminal init, skippable, once per session |
| — | Hero | Command-centre plate, deadpan HUD status, dual CTAs |
| 01 | The Protocol | Editorial asymmetry, philosophy rail, unit stats |
| 02 | Operative Database | GHOST / SHADOW / PHANTOM dossiers |
| 03 | Classified Operations | ZeroSecure 2.0, Cyber Ekathon, BLACKOUT |
| 04 | Engineering Lab | Open bays only — no invented builds |
| 05 | Technical Arsenal | Terminal browser + capability matrix |
| 06 | Record of Operations | Verified-only timeline |
| 07 | Establish Connection | Handshake terminal, channels, closing signature |

**Animation & interaction**

- **Boot sequence** — three log lines, progress rail, `ACCESS GRANTED`, ~1.8 s on screen.
  Runs once per session (`sessionStorage`), always skippable, instant for reduced motion.
- **Masked headline reveals** — each line slides up from behind its own clip mask.
- **Scroll-choreographed sections** — staggered children, drawing rules, counting rails.
- **Glitch typography** — RGB-split layers on `GHOSTS` and `BLACKOUT`, in short bursts
  rather than constant movement.
- **Digital rain** — canvas matrix rain, 24 fps cap, paused off-screen and in background
  tabs, single static frame for reduced motion.
- **Pointer-reactive dossiers** — 3D tilt, spotlight, per-character image grading,
  scan sweep, expandable profile.
- **BLACKOUT classified file** — glitching wordmark, signal-interference flashes, and a
  sealed-file dialog (*MISSION DETAILS ENCRYPTED. / AWAITING AUTHORIZATION.*) with focus
  management and `Esc` to close.
- **Custom cursor** — neon dot + lagging ring, fine-pointer devices only.
- **Magnetic CTAs**, **terminal typewriter** handshake, **scroll-progress** header rail,
  **animated footer** wordmark.
- **Reduced motion** — a first-class path, not an afterthought: no boot, no reveals,
  no parallax, no cursor, static rain. All content is present without animation.

---

## Technology stack

| Layer | Choice |
| --- | --- |
| Framework | React 19 |
| Build tool | Vite 8 |
| Language | TypeScript (strict, project references) |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) |
| Animation | Motion for React (`motion/react`) + a small CSS keyframe set |
| Icons | Lucide React; official brand marks from `simple-icons` |
| Fonts | Self-hosted Space Grotesk / Inter / JetBrains Mono (Fontsource) |
| Images | `sharp` pipeline → responsive WebP at 3 widths |

No backend, database or API keys. Static output, deployable anywhere.

---

## Project structure

```
.
├── index.html                  metadata, OG/Twitter cards, JSON-LD, manifest
├── vercel.json                 build config, cache + security headers
├── public/
│   ├── media/                  generated responsive WebP (do not edit by hand)
│   ├── favicon.svg             the emblem (source of the whole icon set)
│   ├── favicon-32.png · apple-touch-icon.png · icon-192.png · icon-512.png
│   ├── og-image.jpg            social share card
│   └── site.webmanifest        PWA manifest
├── scripts/
│   ├── optimize-images.mjs     raw photos → /public/media + icons + OG card
│   └── qa-content.mjs          server-render QA: 218 content/markup assertions
└── src/
    ├── App.tsx                 page composition, boot gating, single scroll owner
    ├── index.css               design tokens, component classes, keyframes
    ├── components/
    │   ├── BootSequence.tsx    skippable terminal init
    │   ├── Nav.tsx             fixed header, active section, mobile sheet, progress
    │   ├── Footer.tsx          directory, live clock, oversized wordmark
    │   ├── MaskedLines.tsx     line-mask headline reveal
    │   ├── Reveal.tsx          generic scroll reveal
    │   ├── SectionHeading.tsx  shared section masthead
    │   ├── GlitchText.tsx      RGB-split glitch type
    │   ├── DigitalRain.tsx     canvas matrix rain
    │   ├── CustomCursor.tsx    fine-pointer cursor
    │   ├── Magnetic.tsx        magnetic CTA pull
    │   ├── Emblem.tsx          the Ghost Protocol mark
    │   ├── BrandIcon.tsx       GitHub / LinkedIn / Instagram / X marks
    │   ├── HudFrame.tsx · StatusPill.tsx · DecodeLabel.tsx · Clock.tsx
    ├── sections/               one file per numbered section
    │   ├── Hero.tsx · About.tsx · Operatives.tsx · Missions.tsx
    │   ├── Blackout.tsx · Projects.tsx · Arsenal.tsx · Record.tsx · Contact.tsx
    ├── data/                   ← ALL EDITABLE CONTENT
    │   ├── site.ts             brand copy, hero, boot log, channels, arsenal, record
    │   ├── team.ts             the six operatives + portrait paths
    │   ├── missions.ts         four operations, statuses, archive derivation
    │   └── projects.ts         engineering-lab bays
    └── lib/                    motion tokens, media helpers, utilities
```

---

## Installation

Requires **Node 20.19+** (or 22.12+).

```bash
git clone <your-repo-url>
cd GHOSTPROTOCOL
npm ci          # clean install from package-lock.json
```

## Local development

```bash
npm run dev     # http://localhost:5173 (bound to 0.0.0.0)
npm run qa      # server-render content + markup assertions
npm run typecheck
```

## Production build

```bash
npm run build   # tsc -b && vite build → ./dist
npm run preview # serve ./dist locally
```

`dist/` is fully static: HTML, hashed assets, fonts, media, icons, manifest.

---

## Vercel deployment

The repository ships a `vercel.json`, so no dashboard configuration is required.

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 20.19+ (also declared in `package.json` `engines`) |

```
1. Import the repository at vercel.com/new.
2. Vercel reads vercel.json — leave the detected settings as-is.
3. Deploy.
```

Notes
- This is a single-page site with in-page anchors only, so it needs no rewrite rules;
  the static build serves correctly on Vercel's CDN as-is.
- All asset paths are absolute (`/assets/...`, `/media/...`), so they resolve at the
  domain root with or without a trailing subpath.
- `vercel.json` adds long-lived immutable caching for hashed assets and media, plus
  `nosniff`, `SAMEORIGIN`, and a conservative `Referrer-Policy`.
- Before going public, update the `<link rel="canonical">` and `og:url` in `index.html`
  to the real production domain (currently a placeholder — see *Remaining issues*).

---

## Updating content

Everything the site says lives in four typed files. No component edits required.

### Operatives — `src/data/team.ts`

Codenames, full names, designations and roles are **official** and must keep their
spelling. Each record also carries:

```ts
profile:       '…'               // long-form dossier narrative (creative character copy)
brief:         '…'               // one-line brief on the card face
capabilities:  ['…']             // character-profile bullets inside the dossier
image:         MEDIA.operativeGhost   // portrait — see "Images" below
socials:       []                // real destinations only
skills:        []                // technologies that operative actually uses
published:     true              // false withholds the record without deleting it
```

**Nothing about the count is hardcoded.** `activeOperatives` filters on `published`,
and `operativeMeta` derives the clearance counter, the `SIX MINDS. / ONE PROTOCOL.`
headline numeral and the support line from that filtered array. Add a seventh record
and the grid, the counter and the headline all follow.

The `profile` copy is public-facing character material for the site — it is not a claim
of verified professional experience, qualifications or achievements, and the section
footnote says so on the page.

Empty arrays render as `NOT ON RECORD` / `NO PUBLIC CHANNEL ON FILE` — never a
placeholder account.

### Mission history — derived, never duplicated

Each operative stores only mission **ids**:

```ts
missions: ['zerosecure-2', 'cyber-ekathon', 'blackout', 'secleaf-2026']  // GHOST
```

`missionHistory(operative)` resolves those ids against `src/data/missions.ts` and returns
name, number, current status, active flag and solo classification. `isSoloAssignment()`
checks whether exactly one operative holds that mission. Nothing in the UI types a
mission name or status twice, so **changing a mission's `status` updates the archive and
every operative dossier in the same render**.

Current confirmed participation:

| Mission | GHOST | SHADOW | PHANTOM | SPECTRE | CIPHER | MAVERICK |
| --- | --- | --- | --- | --- | --- | --- |
| ZeroSecure 2.0 | yes | yes | yes | — | — | — |
| Cyber Ekathon | yes | yes | — | yes | — | — |
| BLACKOUT (solo) | yes | — | — | — | — | — |
| SECLEAF 2026 | yes | yes | yes | yes | yes | yes |

`data/team.ts` imports `data/missions.ts` (not the reverse), so there is no import cycle.
Operatives are the only thing that references missions; mission-side operatives-assigned
readouts are computed in the components from `activeOperatives`.

### Operations — `src/data/missions.ts`

The archive holds four records:

| # | Mission | Status |
| --- | --- | --- |
| 001 | OPERATION ZEROSECURE 2.0 | COMPLETED |
| 002 | OPERATION CYBER EKATHON | COMPLETED |
| 003 | OPERATION BLACKOUT | ONGOING (SOLO — GHOST) |
| 004 | SECLEAF 2026 | ONGOING |

Change a `status` and everything follows — the badge, the colour tone, the telemetry
rows, the `ARCHIVE // 02 COMPLETE · 02 LIVE` counter and the section note are all
derived:

```ts
statusDisplay: Record<MissionStatus, { label; tone; note; active }>
statusCounts  = { completed, ongoing, upcoming, total, active }
archive       = missions.filter(m => m.published !== false)
featureMission = archive.find(m => m.feature)   // current: BLACKOUT
archiveRows   = the remaining records
```

Each mission also carries a stable `id` and an `operationType` (`SOLO` or `TEAM`), which the
dossier mission history resolves against.

`feature: true` marks the record that renders as the full-bleed classified centrepiece;
everything else renders as an archive row that shifts to the live/briefing treatment
when its status is active. Narrative fields start as `null` and render an explicit
`[ ENCRYPTED · AWAITING SUPPLY ]` marker:

```ts
summary: null,            // → card description
date: null,               // → "AWAITING INTEL"
venue: null,              // → "AWAITING INTEL"
dossier: [{ label: 'CHALLENGES', value: null }, …]
outcomes: []              // results — only verified entries
```

Blackout's `ACCESS CLASSIFIED FILE` button reveals
`MISSION DETAILS ENCRYPTED. / AWAITING AUTHORIZATION.` Keep that copy until the
operation is genuinely declassified.

### Projects — `src/data/projects.ts`

Three placeholder bays. To publish a real build: add an image (below), fill `summary`,
`problem`, `solution`, `stack`, `repo`, `demo`, `year`, and set `status` to
`IN DEVELOPMENT` or `SHIPPED`.

### Contact channels — `src/data/site.ts`

```ts
channels: [
  { key: 'github', label: 'GitHub', handle: null, href: null },
  …
]
```

Set `href` (and optionally `handle`) to publish; until then the row shows `SEALED`.

### Arsenal, brand copy, record

Also in `src/data/site.ts` — categories, hero copy, boot log lines, verified record
entries and the closing sequence.

### Images

Operative portraits are `operative-<codename>.jpg` and mission plates are
`mission-<name>.jpg`, all 4:5 or 16:7 sources. Sources live in `src/assets/raw/`
(git-ignored). Replace a file under the same name, then:

```bash
npm run optimize:images
```

This crops each photo to the ratio its layout uses and emits WebP at three widths into
`public/media/`, regenerating the icon set and OG card as well. Responsive `srcset`
pairs come from `src/lib/media.ts`.

---

## Accessibility & performance notes

- Semantic landmarks, one `h1`, ordered headings, labelled controls, visible neon
  focus rings, and a skip link.
- Dialogs (mobile sheet, classified file) move focus in, close on `Esc`, and restore
  focus to their trigger.
- `aria-controls` is only emitted while the referenced panel is mounted.
- Every photograph has descriptive alt text; decorative plates use `alt=""`.
- `prefers-reduced-motion` removes boot, reveals, parallax, cursor and canvas motion
  without hiding any content.
- Canvas rain pauses when off-screen or backgrounded; display animations are reserved
  for headlines, not body copy.
- Below-the-fold images are lazy with explicit dimensions; fonts are limited to the
  five weights the design actually renders.

### Reveal architecture (important when adding animations)

A line translated below its `overflow-hidden` mask reports **zero** intersection, and an
element jumped past by a fast scroll may never intersect at all. Therefore:

1. The scroll trigger always lives on the **unclipped wrapper**, never the moving line
   (`MaskedLines`, `Blackout`).
2. Reveals use `amount: 'some'` with a tall top `rootMargin` (`160% 0px 15% 0px`) so
   content jumped past still fires.
3. Nothing that a visitor must read is gated behind a timer — content is dimmed or
   animated, never withheld.

---

## QA

```bash
npm run qa
```

Server-renders every section and asserts 218 requirements: all six identities, the six
profile descriptions reproduced verbatim, unique portrait files present on disk, the four
missions with their exact statuses, the exact mission-participation matrix (including
BLACKOUT being GHOST-only and solo), required copy, forbidden strings (including
`BIDBOSS`), absence of invented socials/awards/dates, `alt`/lazy/dimension hygiene,
manifest validity, and SEO metadata.

---

## Content integrity

This build contains **no invented** qualifications, certifications, awards, rankings,
event dates, venues, objectives, results, email addresses or social profiles. Unknown
values are labelled as unknown. Add real details to the data files and the site surfaces
them — nothing else needs to change.

Operative portraits are **original AI-generated illustrations**, not photographs of the
people named, and the section footnote says so on the page. They were produced for this
site in one shared cinematic language (dark command environments, neon-green rim light,
black tactical outerwear) with no real-person likeness, no film branding and no external
image dependencies — every file is served locally from `public/media/`. The `profile`
narrative on each dossier is public-facing character copy, not a record of verified
experience.
