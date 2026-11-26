// Erzeugt die Vorschaubilder (Open Graph, 1200×630 JPG) für WhatsApp, Facebook, LinkedIn & Co.:
//   public/og/catering-<ort>.jpg   für jede Ortsseite aus lib/regions.ts
//   public/og/catering-region.jpg  für /catering
//   public/og/angebot-<kapitel>.jpg für die Angebots-Kapitel
//
// Aufruf (braucht Playwright/Chromium, z.B. in der Cloud-Umgebung vorinstalliert):
//   node scripts/og/og-bilder.cjs
// Gleicher Stil wie public/og-firmen.jpg: Creme links, Foto rechts mit runder Kante, Logo, Titel, Stichworte.

const fs = require('node:fs')
const path = require('node:path')
const { chromium } = require('playwright')

const root = path.resolve(__dirname, '../..')
const out = path.join(root, 'public/og')
fs.mkdirSync(out, { recursive: true })

// Orte aus lib/regions.ts lesen, ohne TypeScript-Build (einfaches Parsen der Objekt-Felder)
function readRegions() {
  const src = fs.readFileSync(path.join(root, 'lib/regions.ts'), 'utf8')
  const body = src.slice(src.indexOf('export const regions'))
  const blocks = body.split(/\n  \{\n/).slice(1)
  return blocks.map((block) => {
    const b = '\n' + block
    const get = (k) => (b.match(new RegExp(`\\n    ${k}: '([^']*)'`)) || [])[1]
    const focus = (b.match(/focus: \[([^\]]*)\]/) || [])[1]
    return {
      slug: get('slug'),
      name: get('name'),
      canton: get('canton'),
      image: get('image'),
      focus: focus ? [...focus.matchAll(/'([^']*)'/g)].map((m) => m[1]) : [],
    }
  })
}

const font = (file) => `data:font/ttf;base64,${fs.readFileSync(path.join(__dirname, 'fonts', file)).toString('base64')}`
const img = (rel) => {
  const p = path.join(root, 'public', rel)
  const ext = path.extname(p).slice(1).replace('jpg', 'jpeg')
  return `data:image/${ext === 'svg' ? 'svg+xml' : ext};base64,${fs.readFileSync(p).toString('base64')}`
}
const logo = img('/brand/ava-logo-horizontal.svg')
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')

function html({ line1, line2, keywords, photo }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:C;src:url(${font('CormorantGaramond-500.ttf')});font-weight:500}
@font-face{font-family:C;src:url(${font('CormorantGaramond-500i.ttf')});font-style:italic;font-weight:500}
@font-face{font-family:J;src:url(${font('Jost-400.ttf')});font-weight:400}
@font-face{font-family:J;src:url(${font('Jost-500.ttf')});font-weight:500}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#FBF7F0;position:relative;overflow:hidden;font-family:J}
.photo{position:absolute;right:0;top:0;width:640px;height:630px;border-radius:640px 0 0 640px / 50% 0 0 50%;overflow:hidden}
.photo img{width:100%;height:100%;object-fit:cover}
.l{position:absolute;left:56px;top:58px;width:560px}
.logo{height:44px}
h1{font-family:C;font-weight:500;color:#2F3916;font-size:66px;line-height:1.02;margin-top:68px;letter-spacing:-.5px}
h1 em{color:#E8650A;font-style:italic;display:block}
.rule{width:60px;height:2px;background:#E8650A;margin:30px 0 24px}
.kw{color:#4A5822;font-size:23px;letter-spacing:.3px}
.foot{position:absolute;left:56px;bottom:52px;color:#6b6656;font-size:20px;letter-spacing:.3px}
</style></head><body>
<div class="photo"><img src="${photo}"></div>
<div class="l"><img class="logo" src="${logo}">
<h1>${esc(line1)}<em>${esc(line2)}</em></h1>
<div class="rule"></div><p class="kw">${keywords.map(esc).join(' · ')}</p></div>
<p class="foot">avacatering.ch · 078 264 69 62</p>
</body></html>`
}

const categories = [
  { slug: 'apero', line1: 'Apéro-Buffet', line2: '& Fingerfood', keywords: ['Firmenapéro', 'Apéro riche', 'Häppchen'], image: '/images/apero-gebaeck.webp' },
  { slug: 'mezze', line1: 'Mezze-Buffet', line2: 'zum Teilen', keywords: ['Warm & kalt', 'Viel Vegetarisch', 'Hausgemacht'], image: '/images/mezze-buffet.webp' },
  { slug: 'lunch', line1: 'Firmenlunch', line2: '& Lunch-Boxen', keywords: ['Meeting', 'Workshop', 'Teamlunch'], image: '/images/lunch-box.webp' },
  { slug: 'themen-party', line1: 'Partyservice', line2: 'mit Motto', keywords: ['Burger', 'Pizza', 'Pasta', 'Geburtstag'], image: '/images/themen-burger.webp' },
  { slug: 'suesses', line1: 'Süsses', line2: '& Gebäck', keywords: ['Kuchen', 'Dessertbuffet', 'Kaffeepause'], image: '/images/suess-torte.webp' },
]

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  const jobs = [
    ...readRegions().map((r) => ({
      file: `catering-${r.slug}.jpg`,
      line1: 'Catering in',
      line2: r.name,
      keywords: ['Apéro', 'Firmenlunch', 'Partyservice'],
      photo: img(r.image),
    })),
    { file: 'catering-region.jpg', line1: 'Catering', line2: 'in der Region', keywords: ['Luzern', 'Aargau', 'Solothurn', 'Bern'], photo: img('/images/tafel-gross.webp') },
    ...categories.map((c) => ({ file: `angebot-${c.slug}.jpg`, line1: c.line1, line2: c.line2, keywords: c.keywords, photo: img(c.image) })),
  ]
  for (const j of jobs) {
    await page.setContent(html(j), { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: path.join(out, j.file), type: 'jpeg', quality: 82 })
    console.log('✓', j.file)
  }
  await browser.close()
})()
