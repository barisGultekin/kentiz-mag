import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'

const internal = (url: string) => url.startsWith('/')

type Props = { url: string; className?: string; children: ReactNode; nav?: boolean }

/** Site paths (/sayilar) use the router; anything else (https:, mailto:) is a plain link. */
export default function SmartLink({ url, className, children, nav }: Props) {
  if (internal(url)) {
    return nav ? (
      <NavLink to={url} end={url === '/'} className={className}>{children}</NavLink>
    ) : (
      <Link to={url} className={className}>{children}</Link>
    )
  }
  const external = /^https?:/.test(url)
  return (
    <a href={url} className={className} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
      {children}
    </a>
  )
}
