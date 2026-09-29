import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'navLink',
  title: 'Bağlantı',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Yazı', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'url',
      title: 'Adres',
      type: 'string',
      description: 'Site içi sayfalar: /, /sayilar, /hakkinda, /topluluk. Dış bağlantılar: https://... ile başlayan tam adres.',
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: 'label', subtitle: 'url' } },
})
