/**
 * GHOST PROTOCOL // ASSET PIPELINE
 * ---------------------------------------------------------------
 * Generates every web-ready image from /src/assets/raw.
 * Run with:  npm run optimize:images
 *
 * Outputs WebP at the exact crop ratios used by the layouts so the
 * browser never has to downscale a huge file on a phone.
 */
import { readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = process.cwd()
const RAW = path.join(ROOT, 'src/assets/raw')
const OUT = path.join(ROOT, 'public/media')

/** Unified colour grade: slightly desaturated, deeper blacks, subtle warm-green lift. */
const grade = (img) =>
  img
    .modulate({ saturation: 0.92, brightness: 0.97 })
    .linear(1.06, -6) // gentle contrast curve
    .sharpen({ sigma: 0.6 })

const jobs = [
  { file: 'hero.jpg', name: 'hero', ratio: 16 / 9, widths: [960, 1600, 2200] },
  { file: 'operative-ghost.jpg', name: 'operative-ghost', ratio: 4 / 5, widths: [640, 1000, 1400] },
  { file: 'operative-shadow.jpg', name: 'operative-shadow', ratio: 4 / 5, widths: [640, 1000, 1400] },
  { file: 'operative-phantom.jpg', name: 'operative-phantom', ratio: 4 / 5, widths: [640, 1000, 1400] },
  { file: 'mission-zerosecure.jpg', name: 'mission-zerosecure', ratio: 3 / 2, widths: [900, 1400, 1900] },
  { file: 'mission-cyber-ekathon.jpg', name: 'mission-cyber-ekathon', ratio: 3 / 2, widths: [900, 1400, 1900] },
  { file: 'mission-blackout.jpg', name: 'mission-blackout', ratio: 16 / 7, widths: [900, 1500, 2100] },
]

async function run() {
  await mkdir(OUT, { recursive: true })
  await mkdir(path.join(ROOT, 'public'), { recursive: true })

  const available = new Set(await readdir(RAW))

  for (const job of jobs) {
    const input = path.join(RAW, job.file)
    if (!available.has(job.file)) {
      console.warn(`  ! missing source: ${job.file}`)
      continue
    }
    for (const width of job.widths) {
      const height = Math.round(width / job.ratio)
      const out = path.join(OUT, `${job.name}-${width}.webp`)
      const pipeline = sharp(input)
        .resize(width, height, { fit: 'cover', position: 'attention' })
        .webp({ quality: 78, effort: 5, smartSubsample: true })
      await grade(pipeline).toFile(out)
      console.log(`  ✓ ${path.relative(ROOT, out)}  ${width}×${height}`)
    }
  }

  // ---- Favicons & touch icons from the vector emblem -------------------
  const emblem = sharp(path.join(ROOT, 'public/favicon.svg'), { density: 600 })
  await emblem.clone().resize(32, 32).png().toFile(path.join(ROOT, 'public/favicon-32.png'))
  await emblem.clone().resize(180, 180).png().toFile(path.join(ROOT, 'public/apple-touch-icon.png'))
  await emblem.clone().resize(192, 192).png().toFile(path.join(ROOT, 'public/icon-192.png'))
  await emblem.clone().resize(512, 512).png().toFile(path.join(ROOT, 'public/icon-512.png'))
  console.log('  ✓ favicon set')

  // ---- Social share card ------------------------------------------------
  const og = await sharp(path.join(RAW, 'hero.jpg'))
    .resize(1200, 630, { fit: 'cover', position: 'attention' })
    .modulate({ brightness: 0.55, saturation: 0.8 })
    .composite([
      {
        input: await sharp(path.join(ROOT, 'public/favicon.svg'), { density: 600 })
          .resize(190, 190)
          .png()
          .toBuffer(),
        left: 120,
        top: 220,
      },
    ])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(path.join(ROOT, 'public/og-image.jpg'))
  console.log(`  ✓ public/og-image.jpg  ${og.width}×${og.height}`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
