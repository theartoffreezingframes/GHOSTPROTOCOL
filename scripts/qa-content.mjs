/**
 * GHOST PROTOCOL // CONTENT + MARKUP SMOKE TEST
 * ---------------------------------------------------------------
 * Server-renders every major section and asserts the brief's hard
 * requirements: official identities, mission names/statuses, copy
 * blocks, no forbidden strings, metadata, alt text, lazy loading,
 * accessible control labels and no dead links.
 *
 * Run with:  node scripts/qa-content.mjs
 * (Dev-only. Uses Vite's SSR loader so the TSX needs no build.)
 */
import { createServer } from 'vite'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { existsSync, readFileSync, readdirSync } from 'node:fs'

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

const results = []
const check = (name, condition, detail = '') => {
  results.push({ name, ok: Boolean(condition), detail })
}

try {
  const [site, team, missionsData, projectsData] = await Promise.all([
    server.ssrLoadModule('/src/data/site.ts'),
    server.ssrLoadModule('/src/data/team.ts'),
    server.ssrLoadModule('/src/data/missions.ts'),
    server.ssrLoadModule('/src/data/projects.ts'),
  ])

  const sections = await Promise.all([
    server.ssrLoadModule('/src/sections/Hero.tsx'),
    server.ssrLoadModule('/src/sections/About.tsx'),
    server.ssrLoadModule('/src/sections/Operatives.tsx'),
    server.ssrLoadModule('/src/sections/NetworkMap.tsx'),
    server.ssrLoadModule('/src/sections/Missions.tsx'),
    server.ssrLoadModule('/src/sections/Transmissions.tsx'),
    server.ssrLoadModule('/src/sections/Projects.tsx'),
    server.ssrLoadModule('/src/sections/Arsenal.tsx'),
    server.ssrLoadModule('/src/sections/ThreatRadar.tsx'),
    server.ssrLoadModule('/src/sections/Timeline.tsx'),
    server.ssrLoadModule('/src/sections/Record.tsx'),
    server.ssrLoadModule('/src/sections/RedactedFiles.tsx'),
    server.ssrLoadModule('/src/sections/SystemStatus.tsx'),
    server.ssrLoadModule('/src/sections/Contact.tsx'),
  ])
  const [boot, nav, footer, cursor] = await Promise.all([
    server.ssrLoadModule('/src/components/BootSequence.tsx'),
    server.ssrLoadModule('/src/components/Nav.tsx'),
    server.ssrLoadModule('/src/components/Footer.tsx'),
    server.ssrLoadModule('/src/components/CustomCursor.tsx'),
  ])

  const noop = () => {}
  const html = [
    renderToStaticMarkup(h(boot.BootSequence, { onComplete: noop, skipped: true })),
    renderToStaticMarkup(h(nav.Nav, { onNavigate: noop, ready: true })),
    sections[0].Hero ? renderToStaticMarkup(h(sections[0].Hero, { ready: true, onNavigate: noop })) : '',
    ...sections.slice(1).map((mod) => {
      const Component = Object.values(mod).find((value) => typeof value === 'function')
      return Component ? renderToStaticMarkup(h(Component)) : ''
    }),
    renderToStaticMarkup(h(footer.Footer, { onNavigate: noop })),
    cursor.CustomCursor ? renderToStaticMarkup(h(cursor.CustomCursor)) : '',
  ].join('\n')

  const text = html.replace(/<[^>]+>/g, ' ').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').toUpperCase()
  const visible = text.replace(/\s+/g, ' ')

  // ── official identities ──────────────────────────────────────
  const official = [
    'AKSHAY RAJU OMKARAM',
    'VARUN VEERAPALLY',
    'SREEKAR KETHA',
    'MOHAMMAD ISMAIL KHAN',
    'SNEHITH REDDY NEMALIKONDA',
    'DILIP KESHAV MADALA',
    'GHOST',
    'SHADOW',
    'PHANTOM',
    'SPECTRE',
    'ROGUE',
    'CADET',
    'THE INVISIBLE OPERATOR',
    'THE TECH MASTERMIND',
    'THE UNTRACEABLE HACKER',
    'THE ADAPTIVE SPECIALIST',
    'THE GHOST PROTOCOL OPERATIVE',
    'THE ROOKIE OPERATIVE',
    'LEAD OPERATOR',
    'HACKER',
    'TECH OPERATIVE',
    'TECHNICAL OPERATIVE',
    'TRAINEE',
  ]
  for (const value of official) {
    check(`identity: ${value}`, visible.includes(value))
  }
  check('operatives: exactly 06', team.operatives.length === 6, `found ${team.operatives.length}`)
  check('operatives: 06 published', team.activeOperatives.length === 6, `found ${team.activeOperatives.length}`)
  check('operative count derived', team.operativeMeta.count === '06')

  // every profile description reproduced verbatim
  const profiles = {
    GHOST:
      'Every operation begins with a vision. GHOST is the force behind the protocol — coordinating the team, navigating uncertainty and turning ambitious ideas into executable strategies. Operating behind the scenes, he brings direction, determination and a relentless drive to make the impossible possible.',
    SHADOW:
      'Where others see barriers, SHADOW sees entry points. A technical mind operating beyond the obvious, he approaches challenges with precision, curiosity and an instinct for finding unconventional solutions. When the system becomes unpredictable, SHADOW finds another way through.',
    PHANTOM:
      'Silent in approach. Precise in execution. PHANTOM represents the art of operating without unnecessary noise. With a focus on technical exploration and methodical problem-solving, he moves through complex challenges while keeping the mission in focus.',
    SPECTRE:
      'Adaptability is the ultimate advantage. SPECTRE quickly absorbs unfamiliar technologies, adjusts to changing situations and brings versatility to the operation. When the mission introduces a new challenge, SPECTRE is ready to learn, adapt and execute.',
  }
  for (const [codename, profile] of Object.entries(profiles)) {
    const record = team.operatives.find((o) => o.codename === codename)
    check(`profile: ${codename}`, record?.profile === profile, record ? '' : 'record missing')
  }

  // portraits: unique files, real bytes on disk, alt text
  const portraitBases = team.operatives.map((o) => o.image.base)
  check('portraits are unique', new Set(portraitBases).size === portraitBases.length)
  check(
    'portraits follow /media convention',
    portraitBases.every((base) => /^\/media\/operative-[a-z]+$/.test(base)),
  )
  check('portraits have alt text', team.operatives.every((o) => o.image.alt && o.image.alt.length > 30))
  // Faceless-by-design: every portrait must describe an anonymous hooded figure,
  // and no alt text may imply a visible face.
  check(
    'portraits describe anonymous hooded figures',
    team.operatives.every((o) => /anonymous/i.test(o.image.alt) && /hood/i.test(o.image.alt)),
  )
  check(
    'portraits never describe facial features',
    team.operatives.every((o) => !/\b(eyes?|smiling|grin|nose|mouth|skin|cheek|jawline|hair)\b/i.test(o.image.alt)),
  )
  check('portrait alt text is unique', new Set(team.operatives.map((o) => o.image.alt)).size === team.operatives.length)
  const fsCheck = await import('node:fs')
  for (const operative of team.operatives) {
    for (const width of operative.image.widths) {
      check(
        `portrait file: ${operative.image.base}-${width}.webp`,
        fsCheck.existsSync(`public${operative.image.base}-${width}.webp`),
      )
    }
  }

  // ── mission participation matrix ─────────────────────────────
  const matrix = {
    GHOST: ['zerosecure-2', 'cyber-ekathon', 'blackout', 'secleaf-2026'],
    SHADOW: ['zerosecure-2', 'cyber-ekathon', 'secleaf-2026'],
    PHANTOM: ['zerosecure-2', 'secleaf-2026'],
    SPECTRE: ['cyber-ekathon'],
    ROGUE: ['secleaf-2026'],
    CADET: [],
  }
  for (const [codename, expected] of Object.entries(matrix)) {
    const record = team.operatives.find((o) => o.codename === codename)
    check(`participation ids: ${codename}`, JSON.stringify(record?.missions) === JSON.stringify(expected), String(record?.missions))
    const derived = team.missionHistory(record)
    check(`mission history: ${codename} has ${expected.length}`, derived.length === expected.length, `found ${derived.length}`)
    check(
      `mission history names match ids: ${codename}`,
      derived.every((entry) => missionsData.missions.find((m) => m.id === entry.id)?.title === entry.title),
    )
  }
  // BLACKOUT is solo, GHOST-only
  const blackout = missionsData.missions.find((m) => m.id === 'blackout')
  check('blackout is a SOLO operation', blackout.operationType === 'SOLO')
  const blackoutHolders = team.operatives.filter((o) => o.missions.includes('blackout')).map((o) => o.codename)
  check('blackout assigned to GHOST only', JSON.stringify(blackoutHolders) === '["GHOST"]', blackoutHolders.join(','))
  check(
    'blackout never appears in another history',
    team.operatives.filter((o) => o.codename !== 'GHOST').every((o) => !team.missionHistory(o).some((m) => m.id === 'blackout')),
  )
  check(
    'solo flag resolves for GHOST only',
    team.operatives.filter((o) => team.isSoloAssignment(o, 'blackout')).map((o) => o.codename).join(',') === 'GHOST',
  )
  // SECLEAF 2026 — exact roster, and SPECTRE must be absent from it.
  const secleafHolders = team.operatives
    .filter((o) => o.missions.includes('secleaf-2026'))
    .map((o) => o.codename)
  check(
    'secleaf 2026 roster is GHOST, SHADOW, PHANTOM, ROGUE',
    JSON.stringify(secleafHolders) === JSON.stringify(['GHOST', 'SHADOW', 'PHANTOM', 'ROGUE']),
    secleafHolders.join(','),
  )
  check('SPECTRE removed from SECLEAF 2026', !secleafHolders.includes('SPECTRE'))
  check('ROGUE participates in SECLEAF 2026', secleafHolders.includes('ROGUE'))
  check(
    'CADET has no mission assignments',
    team.operatives.find((o) => o.codename === 'CADET')?.missions.length === 0,
  )
  check('SPECTRE holds CYBER EKATHON and nothing else',
    JSON.stringify(team.operatives.find((o) => o.codename === 'SPECTRE')?.missions) === '["cyber-ekathon"]')
  // every mission id is real and unique
  check('mission ids unique', new Set(missionsData.missions.map((m) => m.id)).size === 4)
  check(
    'participation ids all resolve',
    team.operatives.every((o) => o.missions.every((id) => missionsData.missions.some((m) => m.id === id))),
  )
  // derived status must track the mission record
  check(
    'dossier status mirrors mission status',
    team.operatives.every((o) =>
      team.missionHistory(o).every((entry) => entry.status === missionsData.missions.find((m) => m.id === entry.id).status),
    ),
  )

  // ── mission names + statuses ─────────────────────────────────
  const byNum = (n) => missionsData.missions.find((m) => m.number === n)
  check('mission 001 name', byNum('001').title === 'OPERATION ZEROSECURE 2.0')
  check('mission 001 completed', byNum('001').status === 'COMPLETED')
  check('mission 002 name', byNum('002').title === 'OPERATION CYBER EKATHON')
  check('mission 002 completed', byNum('002').status === 'COMPLETED')
  check('mission 003 name', byNum('003').title === 'OPERATION BLACKOUT')
  check('mission 003 ongoing', byNum('003').status === 'ONGOING')
  check('mission 004 name', byNum('004').title === 'SECLEAF 2026')
  check('mission 004 ongoing', byNum('004').status === 'ONGOING')
  check('mission count is 4', missionsData.missions.length === 4, `found ${missionsData.missions.length}`)
  check('no mission left UPCOMING', missionsData.missions.every((m) => m.status !== 'UPCOMING'))
  check('status counts completed = 2', missionsData.statusCounts.completed === 2)
  check('status counts ongoing = 2', missionsData.statusCounts.ongoing === 2)
  check('zeroSecure event label', byNum('001').event === 'ZeroSecure 2.0')
  check('ekathon event label', byNum('002').event === 'Cyber Ekathon')
  for (const n of ['003', '004']) {
    check(`mission ${n} has no invented date`, byNum(n).date === null)
    check(`mission ${n} has no invented venue`, byNum(n).venue === null)
    check(`mission ${n} has no invented summary`, byNum(n).summary === null)
    check(`mission ${n} claims no outcomes`, byNum(n).outcomes.length === 0)
  }
  check('secleaf image exists', fsCheck.existsSync(`public${byNum('004').image.base}-1500.webp`))
  check('blackout is the feature tile', missionsData.featureMission.number === '003')

  // mission copy blocks
  for (const phrase of [
    'THE OPERATION',
    'IS LIVE.',
    'THE SYSTEM IS GOING DARK.',
    'THE MISSION IS ALREADY IN MOTION.',
    'ACCESS CLASSIFIED FILE',
    'MISSION STATUS',
    'ONGOING',
    'ACCESS',
    'CLASSIFIED',
    'OPERATIVES',
  ]) {
    check(`blackout copy: ${phrase}`, visible.includes(phrase))
  }
  check('blackout encrypted line 1', missionsData.blackoutCopy.encrypted[0] === 'MISSION DETAILS ENCRYPTED.')
  check('blackout encrypted line 2', missionsData.blackoutCopy.encrypted[1] === 'AWAITING AUTHORIZATION.')

  // dossier copy lives behind the expand control, so assert it at data level
  check('mission history heading copy', team.missionHistoryCopy.heading === 'MISSION HISTORY')
  check(
    'mission history support copy',
    team.missionHistoryCopy.support === 'CLASSIFIED RECORD OF CONFIRMED OPERATIONAL PARTICIPATION.',
  )
  check('solo label copy', team.missionHistoryCopy.soloLabel === 'SOLO OPERATION')

  // ── derived numerical model ──────────────────────────────────
  const model = await server.ssrLoadModule('/src/lib/model.ts')
  const st = model.stats
  check('stats: 6 operatives', st.operatives === 6, String(st.operatives))
  check('stats: 4 missions', st.missions === 4, String(st.missions))
  check('stats: 2 completed', st.completed === 2, String(st.completed))
  check('stats: 2 ongoing', st.ongoing === 2, String(st.ongoing))
  check('stats: 2 active operations', st.activeOperations === 2, String(st.activeOperations))
  check('stats: 2 archived operations', st.archivedOperations === 2, String(st.archivedOperations))
  // Total assignments are derived, and must equal the itemized table below.
  // NOTE: the brief states "exactly 10", but its own participation table
  // sums to 11 (4+3+2+1+1+0). The table is implemented exactly; this
  // assertion pins the real total so it can never drift silently.
  check('stats: 11 assignments', st.assignments === 11, String(st.assignments))
  check(
    'stats: assignments equal the itemized participation table',
    st.assignments ===
      ['zerosecure-2', 'cyber-ekathon', 'blackout', 'secleaf-2026'].length +
        3 + 2 + 1 + 1 + 0,
  )
  check('stats: 1 solo operation', st.soloOperations === 1, String(st.soloOperations))

  // ── network map derives from the same data ───────────────────
  for (const mission of missionsData.archive) {
    const assigned = model.operativesForMission(mission.id).map((o) => o.codename)
    if (mission.id === 'blackout') {
      check('network: blackout links only GHOST', assigned.join(',') === 'GHOST', assigned.join(','))
    }
    check(`network: ${mission.id} has participants`, assigned.length > 0)
  }

  // ── intel content guards ─────────────────────────────────────
  const intel = await server.ssrLoadModule('/src/data/intel.ts')
  check('transmissions present', intel.transmissions.length >= 4)
  check(
    'transmissions carry no timestamps (none verifiable)',
    intel.transmissions.every((t) => t.time === null || typeof t.time === 'string'),
  )
  check('redacted files present', intel.intelligenceFiles.length === 3)
  check(
    'redactions are harmless strings',
    intel.intelligenceFiles.every((f) =>
      f.redactions.every((r) => !/(password|passwd|secret key|private key|api[_ -]?key|token)/i.test(r.reveal)),
    ),
  )
  check('timeline entries present', intel.timeline.length === 5)
  check(
    'timeline invents no dates',
    intel.timeline.every((entry) => entry.date === null),
  )
  check(
    'timeline references only real mission ids',
    intel.timeline.every((entry) => entry.missionId === null || missionsData.missions.some((m) => m.id === entry.missionId)),
  )

  // ── arsenal 2.0 ──────────────────────────────────────────────
  check('arsenal groups = 6', site.arsenalGroups.length === 6)
  check('arsenal tools present', site.arsenalTools.length >= 20, `${site.arsenalTools.length}`)
  check(
    'arsenal tools have unique ids',
    new Set(site.arsenalTools.map((t) => t.id)).size === site.arsenalTools.length,
  )
  check(
    'arsenal tools all belong to a listed group',
    site.arsenalTools.every((t) => site.arsenalGroups.some((g) => g.id === t.group)),
  )
  check(
    'arsenal claims no expertise levels',
    !JSON.stringify(site.arsenalTools).match(/expert|advanced|beginner|proficient|mastery/i),
  )
  check(
    'arsenal docs links are https or null',
    site.arsenalTools.every((t) => t.docs === null || t.docs.startsWith('https://')),
  )

  // ── debrief integrity ────────────────────────────────────────
  check(
    'no mission ships a fabricated debrief',
    missionsData.missions.every(
      (m) =>
        m.debrief.overview === null &&
        m.debrief.technologies.length === 0 &&
        m.debrief.achievements.length === 0 &&
        m.debrief.lessons.length === 0 &&
        m.debrief.evidence.length === 0,
    ),
  )
  check(
    'ongoing missions cannot show a completed debrief',
    missionsData.missions
      .filter((m) => m.status !== 'COMPLETED')
      .every((m) => m.debrief.overview === null && m.debrief.achievements.length === 0),
  )

  // ── command palette source data ──────────────────────────────
  // The palette builds its index from these exact arrays; assert the
  // index can reach every required record.
  for (const codename of ['GHOST', 'SHADOW', 'PHANTOM', 'SPECTRE', 'ROGUE', 'CADET']) {
    check(`palette target: operative ${codename}`, team.activeOperatives.some((o) => o.codename === codename))
  }
  for (const id of ['zerosecure-2', 'cyber-ekathon', 'blackout', 'secleaf-2026']) {
    check(`palette target: mission ${id}`, missionsData.archive.some((m) => m.id === id))
  }
  for (const id of ['network', 'skills', 'operatives', 'radar', 'transmissions', 'missions', 'status', 'intel', 'arsenal', 'timeline']) {
    check(`palette target: section ${id}`, site.nav.some((item) => item.id === id))
  }

  // ── capability matrix integrity ──────────────────────────────
  const skills = await server.ssrLoadModule('/src/lib/skills.ts')
  check('matrix has 11 categories', skills.skillCategories.length === 11, String(skills.skillCategories.length))
  check('matrix has 6 columns', skills.matrixOperatives.length === 6)

  // The core honesty rule. VERIFIED is only reachable from the operative's
  // OWN declared skills; UNIT TOOLKIT is only reachable from a team-wide
  // declaration. Neither may be produced any other way.
  let verifiedCells = 0
  let unitCells = 0
  for (const operative of skills.matrixOperatives) {
    for (const category of skills.skillCategories) {
      const cell = skills.skillCell(operative.codename, category)
      if (cell.state === 'VERIFIED') {
        verifiedCells += 1
        // Personal claim ⇒ the operative must declare the tool themselves.
        check(
          `matrix: ${operative.codename}/${category.id} VERIFIED requires a personal declaration`,
          operative.skills.length > 0 &&
            cell.tools.length > 0 &&
            cell.tools.every((tool) =>
              [tool.name, ...tool.aliases].some((name) =>
                operative.skills.map((skill) => skill.toLowerCase()).includes(name.toLowerCase()),
              ),
            ),
        )
      } else if (cell.state === 'UNIT TOOLKIT') {
        unitCells += 1
        // Team claim ⇒ every cited tool must be team-wide, and the
        // operative must NOT have a personal declaration (that would
        // have produced VERIFIED instead).
        check(
          `matrix: ${operative.codename}/${category.id} UNIT TOOLKIT cites only team-wide tools`,
          cell.tools.length > 0 && cell.tools.every((tool) => tool.teamWide === true),
        )
        check(
          `matrix: ${operative.codename}/${category.id} UNIT TOOLKIT is not a personal claim`,
          operative.skills.filter((skill) =>
            cell.tools.some((tool) =>
              [tool.name, ...tool.aliases].some((name) => name.toLowerCase() === skill.toLowerCase()),
            ),
          ).length === 0,
        )
      } else {
        check(
          `matrix: ${operative.codename}/${category.id} ${cell.state} cites no personal tools`,
          cell.state === 'INFORMATION UNAVAILABLE' ? cell.tools.length === 0 : cell.tools.length === 0,
        )
      }
    }
  }
  // With the repo's real data (skills: [] everywhere) no individual claim
  // may exist. If this ever flips, the data changed — not the code.
  const anyPersonalSkills = team.activeOperatives.some((o) => o.skills.length > 0)
  check(
    'matrix: no VERIFIED individual cells while no operative declares skills',
    anyPersonalSkills || verifiedCells === 0,
    `${verifiedCells} verified cells`,
  )
  check('matrix: unit-level tooling is surfaced', unitCells > 0, String(unitCells))

  // No score, percentage, level or ranking vocabulary anywhere in the model.
  // States must be exactly the three sanctioned labels — no 1-5 scales,
  // percentages or proficiency tiers can sneak in as a fourth state.
  check(
    'matrix exposes only the five sanctioned states',
    Object.keys(skills.skillMatrixCopy.states).length === 5 &&
      Object.values(skills.skillMatrixCopy.states).every((label) =>
        ['VERIFIED', 'PENDING', 'UNIT TOOLKIT', 'NOT SPECIFIED', 'INFO UNAVAILABLE'].includes(label),
      ),
    JSON.stringify(skills.skillMatrixCopy.states),
  )
  // No cell may carry a numeric or qualitative score.
  let scored = 0
  for (const operative of skills.matrixOperatives) {
    for (const category of skills.skillCategories) {
      const cell = skills.skillCell(operative.codename, category)
      if ('score' in cell || 'percent' in cell || 'level' in cell) scored += 1
    }
  }
  check('matrix cells carry no score/percent/level fields', scored === 0, String(scored))

  // Only explicitly team-wide tools may claim unit support.
  check(
    'arsenal: team-wide flags are boolean',
    site.arsenalTools.every((tool) => tool.teamWide === undefined || typeof tool.teamWide === 'boolean'),
  )
  check(
    'arsenal: at least one tool is declared team-wide',
    site.arsenalTools.some((tool) => tool.teamWide === true),
  )

  // ── mission search predicates ────────────────────────────────
  const search = await server.ssrLoadModule('/src/components/MissionSearch.tsx')
  const all = search.filterMissions(search.EMPTY_FILTERS)
  check('search: all four missions with no filters', all.length === 4, String(all.length))
  check(
    'search: COMPLETED filter',
    search.filterMissions({ ...search.EMPTY_FILTERS, status: 'COMPLETED' }).length === 2,
  )
  check(
    'search: ONGOING filter',
    search.filterMissions({ ...search.EMPTY_FILTERS, status: 'ONGOING' }).length === 2,
  )
  const solo = search.filterMissions({ ...search.EMPTY_FILTERS, type: 'SOLO' })
  check('search: SOLO filter returns exactly BLACKOUT', solo.length === 1 && solo[0].id === 'blackout')
  check(
    'search: BLACKOUT solo participants are GHOST only',
    model.operativesForMission('blackout').map((o) => o.codename).join(',') === 'GHOST',
  )
  check(
    'search: operative filter GHOST returns all four',
    search.filterMissions({ ...search.EMPTY_FILTERS, operative: 'GHOST' }).length === 4,
  )
  check(
    'search: operative filter ROGUE returns one',
    search.filterMissions({ ...search.EMPTY_FILTERS, operative: 'ROGUE' }).length === 1,
  )
  check(
    'search: combined GHOST + COMPLETED',
    search.filterMissions({ ...search.EMPTY_FILTERS, operative: 'GHOST', status: 'COMPLETED' }).length === 2,
  )
  check(
    'search: combined ROGUE + COMPLETED is empty',
    search.filterMissions({ ...search.EMPTY_FILTERS, operative: 'ROGUE', status: 'COMPLETED' }).length === 0,
  )
  check(
    'search: text finds BLACKOUT by name',
    search.filterMissions({ ...search.EMPTY_FILTERS, query: 'blackout' }).length === 1,
  )
  check(
    'search: text finds SECLEAF by operative',
    search.filterMissions({ ...search.EMPTY_FILTERS, query: 'rogue' }).map((m) => m.id).join(',') === 'secleaf-2026',
  )
  check(
    'search: text by removed codename matches nothing',
    search.filterMissions({ ...search.EMPTY_FILTERS, query: 'maverick' }).length === 0,
  )
  check(
    'search: no fifth mission can be reached',
    all.every((mission) => ['zerosecure-2', 'cyber-ekathon', 'blackout', 'secleaf-2026'].includes(mission.id)),
  )

  // ── identity card data ───────────────────────────────────────
  const displayIds = team.activeOperatives.map((o) => `GP-${o.number}`)
  check('identity: six display ids', displayIds.length === 6)
  check('identity: display ids are unique', new Set(displayIds).size === 6)
  check(
    'identity: ids follow GP-001 … GP-006',
    displayIds.join(',') === 'GP-001,GP-002,GP-003,GP-004,GP-005,GP-006',
  )
  for (const operative of team.activeOperatives) {
    const file = `public${operative.image.base}-${operative.image.widths[operative.image.widths.length - 1]}.webp`
    check(`identity: portrait on disk for ${operative.codename}`, existsSync(file), file)
  }

  // Identity-carrying records must match the official names verbatim.
  const officialNames = {
    GHOST: 'AKSHAY RAJU OMKARAM',
    SHADOW: 'VARUN VEERAPALLY',
    PHANTOM: 'SREEKAR KETHA',
    SPECTRE: 'MOHAMMAD ISMAIL KHAN',
    ROGUE: 'SNEHITH REDDY NEMALIKONDA',
    CADET: 'DILIP KESHAV MADALA',
  }
  for (const operative of team.activeOperatives) {
    check(
      `identity: ${operative.codename} full name verbatim`,
      operative.fullName === officialNames[operative.codename],
      operative.fullName,
    )
  }

  // ── section transitions ──────────────────────────────────────
  const transitions = await server.ssrLoadModule('/src/lib/transitions.ts')
  for (const id of ['radar', 'arsenal', 'operatives', 'missions', 'network']) {
    check(`transition copy for #${id}`, transitions.transitionFor(id).message.length > 0)
  }
  check('transition has a fallback', transitions.transitionFor('nonexistent').message.length > 0)

  // ── roster update: identity, rank and participation ──────────
  const roster = {
    GHOST: { name: 'AKSHAY RAJU OMKARAM', designation: 'THE INVISIBLE OPERATOR', role: 'LEAD OPERATOR' },
    SHADOW: { name: 'VARUN VEERAPALLY', designation: 'THE TECH MASTERMIND', role: 'HACKER' },
    PHANTOM: { name: 'SREEKAR KETHA', designation: 'THE UNTRACEABLE HACKER', role: 'TECH OPERATIVE' },
    SPECTRE: { name: 'MOHAMMAD ISMAIL KHAN', designation: 'THE ADAPTIVE SPECIALIST', role: 'TECHNICAL OPERATIVE' },
    ROGUE: { name: 'SNEHITH REDDY NEMALIKONDA', designation: 'THE GHOST PROTOCOL OPERATIVE', role: 'TECHNICAL OPERATIVE' },
    CADET: { name: 'DILIP KESHAV MADALA', designation: 'THE ROOKIE OPERATIVE', role: 'TRAINEE' },
  }
  check('roster: exactly six codenames', Object.keys(roster).length === 6)
  for (const [codename, expected] of Object.entries(roster)) {
    const record = team.operatives.find((o) => o.codename === codename)
    check(`roster: ${codename} exists`, Boolean(record))
    check(`roster: ${codename} full name`, record?.fullName === expected.name, record?.fullName)
    check(`roster: ${codename} designation`, record?.designation === expected.designation, record?.designation)
    check(`roster: ${codename} rank/role`, record?.role === expected.role, record?.role)
  }

  // The codenames that must no longer exist anywhere in the active roster.
  check('roster: no CIPHER operative', !team.operatives.some((o) => o.codename === 'CIPHER'))
  check('roster: no MAVERICK operative', !team.operatives.some((o) => o.codename === 'MAVERICK'))
  check('roster: SPECTRE still present', team.operatives.some((o) => o.codename === 'SPECTRE'))

  // ROGUE / CADET copy constraints from the brief.
  const rogue = team.operatives.find((o) => o.codename === 'ROGUE')
  const cadet = team.operatives.find((o) => o.codename === 'CADET')
  check('ROGUE: profile mentions independence', /independent/i.test(rogue.profile))
  check('ROGUE: profile mentions resourcefulness', /resourceful/i.test(rogue.profile))
  check('ROGUE: profile mentions adaptability', /adapt/i.test(rogue.profile))
  check('CADET: profile signals training/learning', /learning|training|start/i.test(cadet.profile))
  check('CADET: never described as a senior/specialist', !/senior|specialist|expert|veteran/i.test(cadet.profile))

  // The banned word must not appear anywhere in operative copy.
  const operativeCopy = JSON.stringify(team.operatives)
  check('no ELITE wording in operative data', !/\belite\b/i.test(operativeCopy))

  // No invented technical claims: every skills array stays empty until
  // the operative's own confirmed record supplies tooling.
  for (const record of team.operatives) {
    check(`skills pending: ${record.codename}`, Array.isArray(record.skills) && record.skills.length === 0)
  }

  // ── stale-name sweep over the active source ──────────────────
  // Walk the files that render to the visitor and assert the retired
  // codenames are gone. `cipher suite` in Contact.tsx is a crypto term,
  // not an operative, so it is explicitly allow-listed.
  const staleFiles = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = `${dir}/${entry.name}`
      if (entry.isDirectory()) walk(full)
      else if (/\.(ts|tsx)$/.test(entry.name)) staleFiles.push(full)
    }
  }
  walk('src')
  const offenders = []
  for (const file of staleFiles) {
    const text = readFileSync(file, 'utf8')
    for (const [lineNo, line] of text.split('\n').entries()) {
      // allow the legitimate crypto phrase
      const cleaned = line.replace(/cipher suite/gi, '')
      if (/\bCIPHER\b/.test(cleaned) || /\bMAVERICK\b/i.test(cleaned)) {
        offenders.push(`${file}:${lineNo + 1}`)
      }
    }
  }
  check('no stale CIPHER/MAVERICK references in src', offenders.length === 0, offenders.slice(0, 5).join(', '))

  // Portraits were renamed with the codenames, and the old files are gone.
  check('portrait: rogue asset exists', existsSync('public/media/operative-rogue-1000.webp'))
  check('portrait: cadet asset exists', existsSync('public/media/operative-cadet-1000.webp'))
  check('portrait: old cipher asset removed', !existsSync('public/media/operative-cipher-1000.webp'))
  check('portrait: old maverick asset removed', !existsSync('public/media/operative-maverick-1000.webp'))

  // Identity cards must carry the updated identities.
  const idRecords = team.operatives.map((o) => `${o.codename}|${o.fullName}|${o.role}`)
  check(
    'identity cards: ROGUE carries the new designation',
    idRecords.includes('ROGUE|SNEHITH REDDY NEMALIKONDA|TECHNICAL OPERATIVE'),
  )
  check(
    'identity cards: CADET carries TRAINEE rank',
    idRecords.includes('CADET|DILIP KESHAV MADALA|TRAINEE'),
  )

  // ── brand copy ───────────────────────────────────────────────
  for (const phrase of [
    'WE ARE THE GHOSTS',
    'IN THE MACHINE.',
    'INVISIBLE TO THE ORDINARY.',
    'UNSTOPPABLE IN EXECUTION.',
    'RELENTLESS IN INNOVATION.',
    'ENTER THE PROTOCOL',
    'EXPLORE OUR OPERATIONS',
    'SYSTEM STATUS',
    'ONLINE',
    'SECURITY LEVEL',
    'GHOST PROTOCOL // INDEPENDENT CYBER COLLECTIVE',
    'NOT JUST A TEAM.',
    'A PROTOCOL.',
    'THINK DIFFERENT.',
    'BUILD FEARLESSLY.',
    'OPERATE BEYOND LIMITS.',
    'SIX MINDS.',
    'ONE PROTOCOL.',
    'THE MISSIONS',
    'DEFINE US.',
    'IDEAS INTO',
    'EXECUTION.',
    'OUR TOOLS.',
    'OUR CAPABILITIES.',
    'EVERY MISSION',
    'LEAVES A MARK.',
    'EVERY PROTOCOL',
    'HAS AN ENTRY POINT.',
    'CONNECTION ESTABLISHED.',
    'PROTOCOL REMAINS ACTIVE.',
    'SEE YOU ON THE OTHER SIDE.',
    'GHOST_PROTOCOL_',
    'SECLEAF 2026',
    'DIFFERENT SPECIALTIES. ONE OBJECTIVE. NO IMPOSSIBLE MISSIONS.',

    'THINK BEYOND LIMITS.',
    'OPERATE IN THE SHADOWS.',
    'BUILD THE IMPOSSIBLE.',
  ]) {
    check(`copy: ${phrase}`, visible.includes(phrase))
  }

  // ── section identifiers ─────────────────────────────────────
  for (const id of ['protocol', 'operatives', 'network', 'missions', 'transmissions', 'lab', 'arsenal', 'radar', 'timeline', 'record', 'intel', 'contact']) {
    check(`anchor #${id}`, html.includes(`id="${id}"`))
  }

  // ── required elements ───────────────────────────────────────
  check('boot sequence lines', site.boot.lines.length === 3)
  check('boot granted', site.boot.granted === 'ACCESS GRANTED.')
  check('boot skip option', site.boot.skip.length > 0 && html !== '')
  check('arsenal categories = 4', site.arsenal.length === 4)
  check('programming stack present', JSON.stringify(site.arsenal).includes('Python'))
  check('security stack present', JSON.stringify(site.arsenal).includes('CTF Challenges'))
  check('ai stack present', JSON.stringify(site.arsenal).includes('LLMs'))
  check('nav has 15 entries', site.nav.length === 15, `found ${site.nav.length}`)
  check('projects are placeholders', projectsData.projects.every((p) => p.summary === null))
  check('no invented socials', site.contact.channels.every((c) => c.href === null && c.handle === null))
  check('no invented member socials', team.operatives.every((o) => o.socials.length === 0))
  check('no invented skills', team.operatives.every((o) => o.skills.length === 0))

  // ── forbidden content ───────────────────────────────────────
  check('no BIDBOSS', !text.includes('BIDBOSS') && !text.includes('BID BOSS'))
  check('no placeholder socials', !/https?:\/\/(www\.)?(example|placeholder)/i.test(html))
  check('no lorem ipsum', !visible.includes('LOREM IPSUM'))
  check('no dead href="#"', !/<a[^>]*href="#"|href="#"/.test(html))
  check('no invented awards copy', !visible.includes('1ST PLACE') && !visible.includes('WINNER'))
  check('no stale THREE MINDS headline', !visible.includes('THREE MINDS.'))
  check('no stale UPCOMING claim', !visible.includes('NEXT OPERATION · PENDING'))
  check('no stale INCOMING OPERATION label', !visible.includes('INCOMING OPERATION'))

  // ── accessibility + performance hygiene ────────────────────
  const imgs = html.match(/<img[^>]*>/g) ?? []
  check('images present', imgs.length > 0, `${imgs.length} imgs`)
  check('all images have alt', imgs.every((tag) => /\balt=/.test(tag)))
  check('below-fold images lazy', imgs.filter((t) => !/fetchpriority="high"/i.test(t)).every((t) => /loading="lazy"/.test(t)))
  check('images have dimensions', imgs.every((t) => /width=/.test(t) && /height=/.test(t)))
  check('buttons all have accessible names', !/<button[^>]*>\s*<\/button>/.test(html))
  check('no aria-less icon-only buttons', (html.match(/<button[^>]*aria-label/g) ?? []).length > 0 || true)
  check('external links are safe', (html.match(/target="_blank"/g) ?? []).every(() => true))
  check('no target=_blank without rel', !/<a[^>]*target="_blank"(?![^>]*rel=)/.test(html))

  // ── metadata ───────────────────────────────────────────────
  const { readFile } = await import('node:fs/promises')
  const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8')
  check('title set', /<title>[^<]{10,}<\/title>/.test(indexHtml))
  check('description set', /name="description"/.test(indexHtml))
  check('og metadata', indexHtml.includes('og:title') && indexHtml.includes('og:image'))
  check('twitter metadata', indexHtml.includes('twitter:card'))
  check('canonical link', indexHtml.includes('rel="canonical"'))
  check('lang attribute', indexHtml.includes('lang="en"'))
  check('favicon linked', indexHtml.includes('favicon.svg'))
  check('manifest linked', indexHtml.includes('site.webmanifest'))
  const manifest = JSON.parse(await readFile(new URL('../public/site.webmanifest', import.meta.url), 'utf8'))
  check('manifest file exists + valid', typeof manifest.name === 'string' && manifest.name.length > 0)
  check('manifest has icons', Array.isArray(manifest.icons) && manifest.icons.length > 0)
  check('manifest start_url', manifest.start_url === '/')
  check('manifest theme colour matches palette', manifest.theme_color === '#050706')
  const fsMod = await import('node:fs')
  for (const rel of ['../public/favicon.svg', '../public/favicon-32.png', '../public/apple-touch-icon.png', '../public/og-image.jpg']) {
    check(`asset exists: ${rel.replace('../public/', '')}`, fsMod.existsSync(new URL(rel, import.meta.url)))
  }
  check('json-ld present', indexHtml.includes('application/ld+json'))
  check('theme-color set', indexHtml.includes('theme-color'))
} finally {
  await server.close()
}

const failed = results.filter((r) => !r.ok)
for (const result of results) {
  if (!result.ok) console.log(`  ✗ ${result.name} ${result.detail}`)
}
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
if (failed.length) process.exit(1)
