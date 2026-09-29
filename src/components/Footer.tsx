import { useLibrary } from '../library'
import SmartLink from './SmartLink'

export default function Footer() {
  const { content } = useLibrary()
  const s = content.settings
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <h3>{s.followTitle}</h3>
            <div className="socials">
              <a className="social" href={s.instagram} target="_blank" rel="noreferrer" aria-label={`${s.siteName} Instagram'da`}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a className="social" href={s.linkedin} target="_blank" rel="noreferrer" aria-label={`${s.siteName} LinkedIn'de`}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
                <circle cx="7.2" cy="7.4" r="1.5" />
                <rect x="5.9" y="10" width="2.6" height="8" />
                <path d="M10.6 10h2.5v1.1c.5-.8 1.4-1.3 2.6-1.3 2.4 0 3.1 1.6 3.1 3.8V18h-2.6v-3.9c0-1.1-.3-1.9-1.4-1.9-1.2 0-1.6.9-1.6 2V18h-2.6z" />
              </svg>
            </a>
            </div>
          </div>
          <div>
            <h3>{s.writeTitle}</h3>
            <a className="mail" href={`mailto:${s.email}`}>{s.email}</a>
            <p className="footer-note">{s.writeNote}</p>
          </div>
          <div>
            <h3>{s.exploreTitle}</h3>
            <ul className="footer-links">
              {s.footerLinks.map((l) => (
                <li key={l.url + l.label}><SmartLink url={l.url}>{l.label}</SmartLink></li>
              ))}
            </ul>
          </div>
        </div>

        <p className="footer-legal">
          <span>{s.publisherLine}</span>
          <span>{s.copyrightLine.replace('{yıl}', String(new Date().getFullYear()))}</span>
        </p>
      </div>
      <div className="footer-mark" aria-hidden="true">{s.siteName}</div>
    </footer>
  )
}
