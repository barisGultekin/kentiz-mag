// Copies the site's built-in Turkish text into Sanity so editors start from what the site shows today.
// Run from studio/:  npm run seed
// Safe to repeat: existing documents are never overwritten.
// DRY_RUN=1 npm run seed  shows what would be created without writing anything.
import { getCliClient } from 'sanity/cli'
import { defaultContent } from '../../src/data/defaults'

const client = getCliClient({ apiVersion: '2025-01-01' })

const docs = [
  { _id: 'siteSettings', _type: 'siteSettings', ...defaultContent.settings },
  { _id: 'homePage', _type: 'homePage', ...defaultContent.home },
  { _id: 'issuesPage', _type: 'issuesPage', ...defaultContent.issues },
  { _id: 'aboutPage', _type: 'aboutPage', ...defaultContent.about },
  { _id: 'communityPage', _type: 'communityPage', ...defaultContent.community },
]

// array items need a _key and, for objects, the schema type the studio expects
const memberType: Record<string, string> = { headerLinks: 'navLink', footerLinks: 'navLink', events: 'event' }

const withKeys = (field: string, v: unknown): unknown =>
  Array.isArray(v)
    ? v.map((item, i) =>
        item && typeof item === 'object' && !('_key' in item)
          ? { _key: `i${i}`, _type: memberType[field], ...(item as object) }
          : item,
      )
    : v

async function run() {
  for (const doc of docs) {
    const prepared = Object.fromEntries(Object.entries(doc).map(([k, v]) => [k, withKeys(k, v)])) as typeof doc & { _id: string }
    const existing = await client.getDocument(doc._id)
    if (existing) {
      console.log(`skip    ${doc._id} (already exists)`)
      continue
    }
    if (process.env.DRY_RUN) {
      console.log(`would create ${doc._id}: ${Object.keys(prepared).filter((k) => !k.startsWith('_')).join(', ')}`)
      continue
    }
    await client.create(prepared as never)
    console.log(`created ${doc._id}`)
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
