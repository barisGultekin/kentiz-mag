import blockContent from './blockContent'
import magazine from './magazine'
import navLink from './navLink'
import { aboutPage, communityPage, homePage, issuesPage, siteSettings } from './pages'

// Documents that exist exactly once; they get fixed IDs and no "create new" button.
export const singletons = [
  { id: 'siteSettings', title: 'Site ayarları' },
  { id: 'homePage', title: 'Ana sayfa' },
  { id: 'issuesPage', title: 'Sayılar sayfası' },
  { id: 'aboutPage', title: 'Hakkında sayfası' },
  { id: 'communityPage', title: 'Topluluk sayfası' },
]

export const schemaTypes = [magazine, blockContent, navLink, siteSettings, homePage, issuesPage, aboutPage, communityPage]
