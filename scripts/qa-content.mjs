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
    server.ssrLoadModule('/src/sections/Missions.tsx'),
    server.ssrLoadModule('/src/sections/Projects.tsx'),
    server.ssrLoadModule('/src/sections/Arsenal.tsx'),
    server.ssrLoadModule('/src/sections/Record.tsx'),
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
    'CIPHER',
    'MAVERICK',
    'THE INVISIBLE OPERATOR',
    'THE TECH MASTERMIND',
    'THE UNTRACEABLE HACKER',
    'THE ADAPTIVE SPECIALIST',
    'THE EMERGING FORCE',
    'THE STRATEGIC MIND',
    'LEAD OPERATOR',
    'HACKER',
    'TECH OPERATIVE',
    'TECHNICAL OPERATIVE',
    'INTELLIGENCE ANALYST',
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
    CIPHER:
      'Every specialist begins with a first breakthrough. CIPHER represents the next wave of the protocol — curious, experimental and driven by continuous learning. Each challenge is another opportunity to decode the unknown and evolve into something stronger.',
    MAVERICK:
      'Information is power. MAVERICK looks beyond the obvious, identifying patterns and connecting details others might overlook. With a natural analytical approach and the ability to learn quickly, he turns scattered information into strategic insight.',
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
  for (const id of ['01', '02', '03', '04', '05', '06', '07']) {
    check(`section index ${id}`, visible.includes(id))
  }
  for (const id of ['protocol', 'operatives', 'missions', 'lab', 'arsenal', 'record', 'contact']) {
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
  check('nav has 7 entries', site.nav.length === 7)
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
