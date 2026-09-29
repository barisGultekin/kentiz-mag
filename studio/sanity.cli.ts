import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  studioHost: 'kentiz',
  deployment: { appId: 'ggaksusnl8qhfsok656voqd9' },
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
})
