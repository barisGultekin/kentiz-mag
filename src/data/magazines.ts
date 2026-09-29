import { client } from './sanityClient'

// One editor in chief; everyone else writes and supplies images, so they share one label.
export type Credits = { editor: string; contributors: string[] }

export type Magazine = {
  id: string
  title: string
  issue: number
  year: number
  date: string // display string, e.g. "Mart 2026"
  sortKey: string // ISO date, used for ordering
  blurb: string
  pdf: string
  credits: Credits
}

// Real issues come from Sanity. Mock issues are added after them unless VITE_MOCK_DATA=false.
const includeMock = import.meta.env.VITE_MOCK_DATA !== 'false'
const query = `*[_type == "magazine" && defined(pdf.asset)] | order(issue asc) {
  "id": _id, title, issue, date, blurb, editor, contributors, "pdf": pdf.asset->url
}`

const monthYear = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })

export async function fetchMagazines(): Promise<Magazine[]> {
  let real: Magazine[] = []
  try {
    real = await fetchFromSanity()
  } catch (err) {
    if (!includeMock) throw err // with mock data on, a CMS outage still leaves the site usable
  }
  // real issues lead, so the shelf opens on the actual magazine; the archive sorts by date on its own
  const byDate = (a: Magazine, b: Magazine) => a.sortKey.localeCompare(b.sortKey)
  return [...real.sort(byDate), ...(includeMock ? [...mockMagazines].sort(byDate) : [])]
}

async function fetchFromSanity(): Promise<Magazine[]> {
  if (!client) return []
  const rows = await client.fetch<{ id: string; title: string; issue: number; date: string; blurb?: string; editor?: string; contributors?: string[]; pdf: string }[]>(query)
  return rows.map(({ editor, contributors, ...r }) => ({
    ...r,
    blurb: r.blurb ?? '',
    year: Number(r.date.slice(0, 4)),
    sortKey: r.date,
    date: monthYear(r.date),
    credits: { editor: editor ?? '', contributors: contributors ?? [] },
  }))
}

// ---- mock data ----

const people = [
  'Zeynep Aydın', 'Mert Kaya', 'Elif Yıldız', 'Can Demirci', 'Selin Öztürk', 'Emre Çelik',
  'Ayşe Korkmaz', 'Burak Şahin', 'Deniz Arslan', 'İrem Polat', 'Kaan Erdem', 'Nehir Güneş',
  'Ege Toprak', 'Defne Acar',
]

// Deterministic credits: 4 to 8 people per issue (1 editor + 3 to 7 contributors).
function creditsFor(n: number): Credits {
  const total = 4 + ((n * 3) % 5)
  const names = Array.from({ length: total }, (_, i) => people[(n * 5 + i * 3) % people.length])
  return { editor: names[0], contributors: names.slice(1) }
}

const seeds: [string, string, string, string][] = [
  ['harbour', 'Harbour', '2024-01-15', 'Çalışan limanların yavaş dönüşü'],
  ['signal', 'Signal', '2024-04-15', 'Sessiz saatler için yeniden kurulan radyo'],
  ['orchard', 'Orchard', '2024-07-15', 'Artık kimsenin satmadığı kırk elma'],
  ['atlas', 'Atlas', '2024-10-15', 'Bilerek yanlış çizilen haritalar'],
  ['tide', 'Tide', '2025-01-15', 'Deniz kıyısına bir saha rehberi'],
  ['ember', 'Ember', '2025-04-15', 'Son fırınların hâlâ bildikleri'],
  ['verse', 'Verse', '2025-07-15', 'On iki küçük yayınevinden yeni şiirler'],
  ['grain', 'Grain', '2025-10-15', 'Ekmek, fırıncılar ve uzun mayalanma'],
  ['lantern', 'Lantern', '2026-01-15', 'Gece pazarları ve onları aydınlatanlar'],
  ['meadow', 'Meadow', '2026-04-15', 'Biçilmemiş son tarlalardan notlar'],
]

export const mockMagazines: Magazine[] = seeds.map(([id, title, iso, blurb], i) => ({
  id,
  title,
  issue: i + 1,
  year: Number(iso.slice(0, 4)),
  date: monthYear(iso),
  sortKey: iso,
  blurb,
  pdf: `/magazines/${id}.pdf`,
  credits: creditsFor(i + 1),
}))
