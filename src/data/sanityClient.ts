import { createClient } from '@sanity/client'

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID as string | undefined

export const client = projectId
  ? createClient({
      projectId,
      dataset: (import.meta.env.VITE_SANITY_DATASET as string) || 'production',
      apiVersion: '2025-01-01',
      useCdn: true,
    })
  : null
