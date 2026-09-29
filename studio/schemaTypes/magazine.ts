import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'magazine',
  title: 'Dergi sayısı',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Başlık', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'issue',
      title: 'Sayı numarası',
      type: 'number',
      description: 'Sayılar yayın tarihine göre sıralanır; bu numara sayının üzerinde görünür.',
      validation: (r) => r.required().integer().min(1),
    }),
    defineField({ name: 'date', title: 'Yayın tarihi', type: 'date', validation: (r) => r.required() }),
    defineField({
      name: 'blurb',
      title: 'Kapak cümlesi',
      type: 'string',
      description: 'Başlığın altında görünen kısa bir cümle.',
      validation: (r) => r.max(90),
    }),
    defineField({
      name: 'editor',
      title: 'Editör',
      type: 'string',
    }),
    defineField({
      name: 'contributors',
      title: 'Katkıda bulunanlar',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Bu sayı için yazan veya görsel sağlayan herkes, her satıra bir isim. Genellikle 3 ile 7 kişi.',
      validation: (r) => r.max(10),
    }),
    defineField({
      name: 'pdf',
      title: 'Dergi PDF dosyası',
      type: 'file',
      description: 'İlk sayfa ön kapak, son sayfa arka kapak olur.',
      options: { accept: 'application/pdf' },
      validation: (r) => r.required(),
    }),
  ],
  orderings: [{ title: 'Sayı numarası', name: 'issue', by: [{ field: 'issue', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', issue: 'issue', date: 'date' },
    prepare: ({ title, issue, date }) => ({ title, subtitle: `Sayı ${issue}, ${date ?? ''}` }),
  },
})
