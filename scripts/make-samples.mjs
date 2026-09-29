// Generates sample magazine PDFs into public/magazines so the reader has something to show.
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { writeFile } from 'node:fs/promises'

const W = 595, H = 794
const issues = [
  { id: 'harbour', title: 'Harbour', line: 'The slow return of working ports', bg: [0.08, 0.2, 0.35], fg: [0.96, 0.93, 0.85], ac: [0.95, 0.6, 0.25] },
  { id: 'signal', title: 'Signal', line: 'Radio, rebuilt for the quiet hours', bg: [0.85, 0.2, 0.2], fg: [1, 1, 1], ac: [0.1, 0.1, 0.15] },
  { id: 'orchard', title: 'Orchard', line: 'Forty apples nobody sells anymore', bg: [0.75, 0.85, 0.55], fg: [0.1, 0.2, 0.1], ac: [0.7, 0.15, 0.25] },
  { id: 'atlas', title: 'Atlas', line: 'Maps that were wrong on purpose', bg: [0.95, 0.85, 0.35], fg: [0.12, 0.12, 0.2], ac: [0.15, 0.3, 0.75] },
  { id: 'tide', title: 'Tide', line: 'A field guide to the edge of the sea', bg: [0.3, 0.65, 0.7], fg: [0.03, 0.15, 0.2], ac: [1, 0.95, 0.8] },
  { id: 'ember', title: 'Ember', line: 'What the last kilns still know', bg: [0.15, 0.1, 0.12], fg: [1, 0.88, 0.75], ac: [0.95, 0.4, 0.2] },
  { id: 'verse', title: 'Verse', line: 'New poems from twelve small presses', bg: [0.75, 0.65, 0.9], fg: [0.15, 0.08, 0.3], ac: [1, 1, 0.9] },
  { id: 'grain', title: 'Grain', line: 'Bread, bakers and the long ferment', bg: [0.9, 0.78, 0.6], fg: [0.25, 0.14, 0.06], ac: [0.4, 0.5, 0.2] },
  { id: 'lantern', title: 'Lantern', line: 'Night markets and the people who light them', bg: [0.98, 0.72, 0.3], fg: [0.25, 0.08, 0.05], ac: [0.85, 0.2, 0.15] },
  { id: 'meadow', title: 'Meadow', line: 'Notes from the last unmowed fields', bg: [0.45, 0.72, 0.45], fg: [0.04, 0.18, 0.06], ac: [1, 0.9, 0.4] },
]
const words = 'the quiet harbour morning light street market season window table river paper field stone garden voice engine bridge winter summer hands letters slow small careful long careful remember begin build carry keep return older newer between across before after every nothing something whole half'.split(' ')

let seed = 7
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
const pick = () => words[Math.floor(rnd() * words.length)]
const sentence = () => {
  const s = Array.from({ length: 8 + Math.floor(rnd() * 10) }, pick).join(' ')
  return s[0].toUpperCase() + s.slice(1) + '.'
}
const paragraph = () => Array.from({ length: 3 + Math.floor(rnd() * 3) }, sentence).join(' ')

function wrap(text, font, size, width) {
  const lines = []; let line = ''
  for (const w of text.split(' ')) {
    const t = line ? line + ' ' + w : w
    if (font.widthOfTextAtSize(t, size) > width) { lines.push(line); line = w } else line = t
  }
  if (line) lines.push(line)
  return lines
}

for (const [n, it] of issues.entries()) {
  seed = 11 + n * 97
  const doc = await PDFDocument.create()
  const sans = await doc.embedFont(StandardFonts.HelveticaBold)
  const serif = await doc.embedFont(StandardFonts.TimesRoman)
  const serifI = await doc.embedFont(StandardFonts.TimesRomanItalic)
  const bg = rgb(...it.bg), fg = rgb(...it.fg), ac = rgb(...it.ac)
  const total = 12

  // cover
  let p = doc.addPage([W, H])
  p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: bg })
  p.drawCircle({ x: W * 0.72, y: H * 0.36, size: 190, color: ac })
  p.drawText(it.title.toUpperCase(), { x: 36, y: H - 150, size: Math.min(150, 150 * (W - 90) / sans.widthOfTextAtSize(it.title.toUpperCase(), 150)), font: sans, color: fg })
  p.drawText(`Kentiz  -  Issue ${String(n + 1).padStart(2, '0')}`, { x: 40, y: H - 190, size: 14, font: sans, color: fg })
  for (const [i, l] of wrap(it.line, serifI, 30, 320).entries())
    p.drawText(l, { x: 40, y: 150 - i * 34, size: 30, font: serifI, color: fg })

  for (let i = 1; i < total - 1; i++) {
    p = doc.addPage([W, H])
    const left = i % 2 === 1
    const m = 52
    p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(0.995, 0.995, 0.99) })
    // folio
    p.drawText(`${it.title}  ${i + 1}`, { x: left ? m : W - m - 60, y: 30, size: 9, font: sans, color: rgb(0.45, 0.45, 0.45) })
    const feature = i % 3 === 1
    if (feature) {
      p.drawRectangle({ x: 0, y: H * 0.45, width: W, height: H * 0.55, color: bg })
      p.drawCircle({ x: left ? W * 0.75 : W * 0.25, y: H * 0.72, size: 90 + rnd() * 70, color: ac })
      const head = sentence().split(' ').slice(0, 5).join(' ')
      for (const [k, l] of wrap(head, sans, 40, W - m * 2).entries())
        p.drawText(l, { x: m, y: H * 0.45 + 70 - k * 44, size: 40, font: sans, color: fg })
    } else {
      const head = sentence().split(' ').slice(0, 4).join(' ')
      p.drawText(head, { x: m, y: H - 90, size: 30, font: sans, color: bg })
      p.drawRectangle({ x: m, y: H - 108, width: 60, height: 4, color: ac })
    }
    // two columns of text
    const top = feature ? H * 0.45 - 40 : H - 140
    const colW = (W - m * 2 - 24) / 2
    for (let c = 0; c < 2; c++) {
      let y = top
      while (y > 70) {
        for (const l of wrap(paragraph(), serif, 10.5, colW)) {
          if (y < 70) break
          p.drawText(l, { x: m + c * (colW + 24), y, size: 10.5, font: serif, color: rgb(0.12, 0.12, 0.14) })
          y -= 14
        }
        y -= 8
      }
    }
  }

  // back cover
  p = doc.addPage([W, H])
  p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: bg })
  p.drawCircle({ x: W * 0.28, y: H * 0.64, size: 120, color: ac })
  p.drawText('Kentiz', { x: 40, y: 100, size: 40, font: sans, color: fg })
  p.drawText('Read the next issue soon.', { x: 40, y: 72, size: 16, font: serifI, color: fg })
  await writeFile(`public/magazines/${it.id}.pdf`, await doc.save())
}
console.log(`wrote ${issues.length} sample magazines`)
