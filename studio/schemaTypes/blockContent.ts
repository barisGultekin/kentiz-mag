import { defineArrayMember, defineField, defineType } from 'sanity'

// Rich text for page bodies: paragraphs, one heading level, bullet lists, bold and links.
export default defineType({
  name: 'blockContent',
  title: 'Metin',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Paragraf', value: 'normal' },
        { title: 'Alt başlık', value: 'h2' },
      ],
      lists: [{ title: 'Madde işaretli liste', value: 'bullet' }],
      marks: {
        decorators: [{ title: 'Kalın', value: 'strong' }],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Bağlantı',
            fields: [
              defineField({
                name: 'href',
                type: 'string',
                title: 'Adres',
                description: 'Site içi sayfa için /topluluk gibi, e-posta için mailto:ad@ornek.com, dış site için https://... yazın.',
                validation: (r) => r.required(),
              }),
            ],
          },
        ],
      },
    }),
  ],
})
