// Built-in Turkish text. It is shown until the matching document exists in Sanity, and
// `npm run seed` (in studio/) copies it into Sanity so editors start from what the site shows today.
import type { PortableTextBlock } from '@portabletext/types'
import type { SiteContent } from './content'

let counter = 0
const key = () => `d${counter++}`

type Piece = string | { text: string; bold: true } | { text: string; href: string }

function block(pieces: Piece[], opts: { style?: 'normal' | 'h2'; bullet?: boolean } = {}): PortableTextBlock {
  const markDefs: { _key: string; _type: 'link'; href: string }[] = []
  const children = pieces.map((p) => {
    if (typeof p === 'string') return { _type: 'span', _key: key(), text: p, marks: [] as string[] }
    if ('href' in p) {
      const def = { _key: key(), _type: 'link' as const, href: p.href }
      markDefs.push(def)
      return { _type: 'span', _key: key(), text: p.text, marks: [def._key] }
    }
    return { _type: 'span', _key: key(), text: p.text, marks: ['strong'] }
  })
  return {
    _type: 'block',
    _key: key(),
    style: opts.style ?? 'normal',
    markDefs,
    children,
    ...(opts.bullet ? { listItem: 'bullet', level: 1 } : {}),
  } as PortableTextBlock
}

const p = (...pieces: Piece[]) => block(pieces)
const h2 = (text: string) => block([text], { style: 'h2' })
const li = (...pieces: Piece[]) => block(pieces, { bullet: true })

const email = 'hello@kentiz.example'
const orgName = 'Kentiz Şehircilik Topluluğu'

export const defaultContent: SiteContent = {
  settings: {
    siteName: 'Kentiz',
    siteTitle: 'Kentiz Dergi',
    siteDescription: 'Kentiz: kentler, kentliler ve kent yaşamı üzerine dergi. Tüm sayıları çevrimiçi okuyun.',
    orgName,
    email,
    instagram: 'https://www.instagram.com/kentizmag',
    linkedin: 'https://www.linkedin.com/company/kentiz',
    headerLinks: [
      { label: 'Ana sayfa', url: '/' },
      { label: 'Sayılar', url: '/sayilar' },
      { label: 'Hakkında', url: '/hakkinda' },
      { label: 'Topluluk', url: '/topluluk' },
    ],
    followTitle: 'Takip edin',
    writeTitle: 'Bize yazın',
    writeNote: 'Yazı önerilerinizi, düzeltmelerinizi ve selamlarınızı bekleriz.',
    exploreTitle: 'Keşfedin',
    footerLinks: [
      { label: 'Sayılar', url: '/sayilar' },
      { label: 'Hakkında', url: '/hakkinda' },
      { label: 'Topluluk', url: '/topluluk' },
    ],
    publisherLine: `Kentiz Dergisi, ${orgName} tarafından yayımlanır.`,
    copyrightLine: `© {yıl} ${orgName}. Tüm hakları saklıdır.`,
  },
  home: {
    hint: 'Sürükleyin, kaydırın ya da ok tuşlarını kullanın',
    archiveTitle: 'Tüm sayılar, yıllara göre',
    archiveLinkLabel: 'Tüm sayıları gör',
  },
  issues: {
    title: 'Sayılar',
    lead: 'Yayımladığımız tüm sayılar, en yeniden en eskiye. Sayıyı kimlerin hazırladığını görmek için bir kapağa tıklayın.',
  },
  about: {
    title: 'Kentiz Hakkında',
    lead: 'Kentleri, kentlileri ve kent yaşamını konu alan, topluluk üyelerince hazırlanan bir dergi.',
    body: [
      p('Kentiz, kentler üzerine düşünmek isteyenlerin bir araya gelmesiyle doğdu. Her sayı; yazılar, fotoğraflar ve illüstrasyonlarla tek bir konuyu ele alır: sağlıklı kentler, yeşil altyapılar, sürdürülebilirlik ve daha fazlası.'),
      p('Her sayıyı dört ila sekiz kişilik gönüllü bir ekip hazırlar. Bir editör sayının yönünü belirler, diğer üyeler hem yazılarını yazar hem de görsellerini sağlar. Tüm sayılar çevrimiçi olarak ücretsiz okunabilir.'),
      h2('Nasıl çalışıyoruz'),
      li({ text: 'Her sayıda tek bir konu.', bold: true }, ' Yazmaya başlamadan önce konuyu birlikte tartışırız.'),
      li({ text: 'Önce kentte yaşayanlar.', bold: true }, ' Konuya en yakın kişilerden yazı isteriz.'),
      li({ text: 'Basılı ve ekranda aynı.', bold: true }, ' Sayfalar çift sayfa düzenine göre tasarlanır, çevrimiçi de aynı şekilde okunur.'),
      h2('Kim yayımlıyor'),
      p(`Kentiz Dergisi, ${orgName} tarafından yayımlanır. Bize `, { text: email, href: `mailto:${email}` }, ' adresinden ulaşabilir ya da ', { text: 'topluluk sayfasından', href: '/topluluk' }, ' etkinliklerimize katılabilirsiniz.'),
    ],
  },
  community: {
    title: 'Topluluk',
    lead: "Kentiz'i editörler kadar okurlar da var eder. Katılmanın yolları burada.",
    eventsTitle: 'Yaklaşan etkinlikler',
    events: [
      { title: 'Okuma buluşması', date: '2026-10-18', place: 'Liman Caddesi Kütüphanesi, 18.00' },
      { title: 'Açık editör toplantısı', date: '2026-11-07', place: 'Çevrimiçi, 19.00' },
      { title: 'Zin değiş tokuşu ve baskı günü', date: '2026-11-29', place: 'Eski Fırın Atölyesi, 11.00' },
    ],
    body: [
      h2('Yazı önerin'),
      p('Her sayı için yazı önerilerini kabul ediyoruz. Fikrinizi iki üç cümleyle anlatın, daha önceki çalışmalarınıza bir bağlantı ekleyin ve ', { text: email, href: `mailto:${email}` }, ' adresine gönderin. İki hafta içinde yanıt veriyoruz.'),
    ],
  },
}
