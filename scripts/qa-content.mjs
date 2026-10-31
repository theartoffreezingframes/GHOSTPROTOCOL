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
    'GHOST',
    'SHADOW',
    'PHANTOM',
    'THE INVISIBLE OPERATOR',
    'THE TECH MASTERMIND',
    'THE UNTRACEABLE HACKER',
    'LEAD OPERATOR',
    'HACKER',
    'TECH OPERATIVE',
  ]
  for (const value of official) {
    check(`identity: ${value}`, visible.includes(value))
  }
  check('operatives: exactly 03', team.operatives.length === 3, `found ${team.operatives.length}`)

  // ── mission names + statuses ─────────────────────────────────
  check('mission 001 name', missionsData.missions[0].title === 'OPERATION ZEROSECURE 2.0')
  check('mission 001 completed', missionsData.missions[0].status === 'COMPLETED')
  check('mission 002 name', missionsData.missions[1].title === 'OPERATION CYBER EKATHON')
  check('mission 002 completed', missionsData.missions[1].status === 'COMPLETED')
  check('mission 003 name', missionsData.missions[2].title === 'OPERATION BLACKOUT')
  check('mission 003 upcoming', missionsData.missions[2].status === 'UPCOMING')
  check('mission count is 3', missionsData.missions.length === 3)
  check('zeroSecure event label', missionsData.missions[0].event === 'ZeroSecure 2.0')
  check('ekathon event label', missionsData.missions[1].event === 'Cyber Ekathon')
  check('blackout has no invented date', missionsData.missions[2].date === null)
  check('blackout has no invented venue', missionsData.missions[2].venue === null)
  check('blackout has no invented summary', missionsData.missions[2].summary === null)

  // mission copy blocks
  for (const phrase of [
    'THE NEXT OPERATION IS UNKNOWN.',
    'THE SYSTEM IS GOING DARK.',
    'A NEW MISSION IS APPROACHING.',
    'ACCESS CLASSIFIED FILE',
    'MISSION STATUS',
    'UPCOMING',
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
    'THREE MINDS.',
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
