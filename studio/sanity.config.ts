import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes, singletons } from './schemaTypes'

const singletonIds = singletons.map((s) => s.id)

export default defineConfig({
  name: 'default',
  title: 'Kentiz Dergi',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('İçerik')
          .items([
            S.documentTypeListItem('magazine').title('Dergi sayıları'),
            S.divider(),
            ...singletons.map((s) =>
              S.listItem().title(s.title).id(s.id).child(S.document().schemaType(s.id).documentId(s.id)),
            ),
          ]),
    }),
  ],
  schema: { types: schemaTypes },
  document: {
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === 'global' ? prev.filter((t) => !singletonIds.includes(t.templateId)) : prev,
    actions: (prev, { schemaType }) =>
      singletonIds.includes(schemaType) ? prev.filter((a) => a.action && ['publish', 'discardChanges', 'restore'].includes(a.action)) : prev,
  },
})
