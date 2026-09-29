import { defineField, defineType } from 'sanity'

const text = (name: string, title: string, description?: string, rows?: number) =>
  defineField({ name, title, description, type: rows ? 'text' : 'string', rows, validation: (r) => r.required() })

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site ayarları',
  type: 'document',
  fields: [
    text('siteName', 'Site adı', 'Sol üstteki yazı ve sayfa sonundaki büyük yazı.'),
    text('siteTitle', 'Tarayıcı sekmesi başlığı'),
    text('siteDescription', 'Arama motorları için kısa açıklama', undefined, 3),
    text('orgName', 'Yayıncı kuruluşun tam adı'),
    text('email', 'E-posta adresi', 'Sayfa sonunda ve Topluluk sayfasında kullanılır.'),
    defineField({ name: 'instagram', title: 'Instagram adresi', type: 'url', validation: (r) => r.uri({ scheme: ['https'] }) }),
    defineField({ name: 'linkedin', title: 'LinkedIn adresi', type: 'url', validation: (r) => r.uri({ scheme: ['https'] }) }),
    defineField({ name: 'headerLinks', title: 'Üst menü bağlantıları', type: 'array', of: [{ type: 'navLink' }] }),
    text('followTitle', 'Sayfa sonu: sosyal medya başlığı'),
    text('writeTitle', 'Sayfa sonu: e-posta başlığı'),
    text('writeNote', 'Sayfa sonu: e-posta altındaki not', undefined, 2),
    text('exploreTitle', 'Sayfa sonu: bağlantılar başlığı'),
    defineField({ name: 'footerLinks', title: 'Sayfa sonu bağlantıları', type: 'array', of: [{ type: 'navLink' }] }),
    text('publisherLine', 'Sayfa sonu: yayıncı cümlesi'),
    text('copyrightLine', 'Sayfa sonu: telif cümlesi', '{yıl} yazdığınız yere her yıl otomatik olarak güncel yıl gelir.'),
  ],
  preview: { prepare: () => ({ title: 'Site ayarları' }) },
})

export const homePage = defineType({
  name: 'homePage',
  title: 'Ana sayfa',
  type: 'document',
  fields: [
    text('hint', 'Kapakların altındaki ipucu'),
    text('archiveTitle', 'Arşiv bölümü başlığı'),
    text('archiveLinkLabel', 'Arşiv bölümü bağlantı yazısı'),
  ],
  preview: { prepare: () => ({ title: 'Ana sayfa' }) },
})

export const issuesPage = defineType({
  name: 'issuesPage',
  title: 'Sayılar sayfası',
  type: 'document',
  fields: [text('title', 'Başlık'), text('lead', 'Alt başlık', undefined, 3)],
  preview: { prepare: () => ({ title: 'Sayılar sayfası' }) },
})

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'Hakkında sayfası',
  type: 'document',
  fields: [
    text('title', 'Başlık'),
    text('lead', 'Alt başlık', undefined, 3),
    defineField({ name: 'body', title: 'Sayfa metni', type: 'blockContent' }),
  ],
  preview: { prepare: () => ({ title: 'Hakkında sayfası' }) },
})

export const communityPage = defineType({
  name: 'communityPage',
  title: 'Topluluk sayfası',
  type: 'document',
  fields: [
    text('title', 'Başlık'),
    text('lead', 'Alt başlık', undefined, 3),
    text('eventsTitle', 'Etkinlikler başlığı'),
    defineField({
      name: 'events',
      title: 'Etkinlikler',
      type: 'array',
      description: 'Tarihe göre otomatik sıralanır. Listeyi boşaltırsanız etkinlikler bölümü gizlenir.',
      of: [
        {
          type: 'object',
          name: 'event',
          title: 'Etkinlik',
          fields: [
            defineField({ name: 'title', title: 'Etkinlik adı', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'date', title: 'Tarih', type: 'date', validation: (r) => r.required() }),
            defineField({ name: 'place', title: 'Yer ve saat', type: 'string', description: 'Örnek: Kütüphane, 18.00' }),
          ],
          preview: { select: { title: 'title', subtitle: 'date' } },
        },
      ],
    }),
    defineField({ name: 'body', title: 'Etkinliklerin altındaki metin', type: 'blockContent' }),
  ],
  preview: { prepare: () => ({ title: 'Topluluk sayfası' }) },
})
