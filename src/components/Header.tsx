import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLibrary } from '../library'
import SmartLink from './SmartLink'

export default function Header() {
  const { content } = useLibrary()
  const { siteName, headerLinks } = content.settings
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <Link to="/" className="mark" aria-label={`${siteName}, ana sayfa`}>{siteName}</Link>
      <nav aria-label="Ana menü">
        {headerLinks.map((l) => (
          <SmartLink key={l.url + l.label} url={l.url} nav>{l.label}</SmartLink>
        ))}
      </nav>
    </header>
  )
}
