import type { PortableTextBlock } from '@portabletext/types'
import { defaultContent } from './defaults'
import { client } from './sanityClient'

export type NavLink = { label: string; url: string }
export type CommunityEvent = { title: string; date: string; place: string }

export type SiteContent = {
  settings: {
    siteName: string
    siteTitle: string
    siteDescription: string
    orgName: string
    email: string
    instagram: string
    linkedin: string
    headerLinks: NavLink[]
    followTitle: string
    writeTitle: string
    writeNote: string
    exploreTitle: string
    footerLinks: NavLink[]
    publisherLine: string
    copyrightLine: string // "{yıl}" is replaced by the current year
  }
  home: { hint: string; archiveTitle: string; archiveLinkLabel: string }
  issues: { title: string; lead: string }
  about: { title: string; lead: string; body: PortableTextBlock[] }
  community: { title: string; lead: string; eventsTitle: string; events: CommunityEvent[]; body: PortableTextBlock[] }
}

const ids: Record<keyof SiteContent, string> = {
  settings: 'siteSettings',
  home: 'homePage',
  issues: 'issuesPage',
  about: 'aboutPage',
  community: 'communityPage',
}

const query = `{${Object.entries(ids)
  .map(([k, id]) => `"${k}": *[_id == "${id}"][0]`)
  .join(', ')}}`

// A page that exists in Sanity is used as written (lists may be empty, text falls back if left blank).
// A page that does not exist yet falls back entirely to the built-in text.
function section<K extends keyof SiteContent>(key: K, doc: Record<string, unknown> | null): SiteContent[K] {
  const base = defaultContent[key] as Record<string, unknown>
  if (!doc) return base as SiteContent[K]
  const out: Record<string, unknown> = {}
  for (const [field, fallback] of Object.entries(base)) {
    const v = doc[field]
    out[field] = Array.isArray(fallback) ? (v ?? []) : v == null || v === '' ? fallback : v
  }
  return out as SiteContent[K]
}

export async function fetchContent(): Promise<SiteContent> {
  if (!client) return defaultContent
  try {
    const docs = await client.fetch<Record<keyof SiteContent, Record<string, unknown> | null>>(query)
    return {
      settings: section('settings', docs.settings),
      home: section('home', docs.home),
      issues: section('issues', docs.issues),
      about: section('about', docs.about),
      community: section('community', docs.community),
    }
  } catch {
    return defaultContent // a CMS outage must not blank the site
  }
}
