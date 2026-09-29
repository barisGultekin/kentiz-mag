import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Magazine } from '../data/magazines'
import { useLibrary } from '../library'

type Props = {
  items: Magazine[]
  size: 'md' | 'lg'
  order?: 'newest' | 'oldest'
  scope: string // keeps reader hand-off keys unique per page section
}

type Active = { mag: Magazine; el: HTMLElement }

export default function YearRows({ items, size, order = 'newest', scope }: Props) {
  const { covers, openedKey, openReader } = useLibrary()
  const [active, setActive] = useState<Active | null>(null)

  const rows = useMemo(() => {
    const byYear = new Map<number, Magazine[]>()
    for (const m of items) byYear.set(m.year, [...(byYear.get(m.year) ?? []), m])
    const years = [...byYear.keys()].sort((a, b) => (order === 'newest' ? b - a : a - b))
    return years.map((y) => ({
      year: y,
      issues: byYear.get(y)!.sort((a, b) => (order === 'newest' ? b.sortKey.localeCompare(a.sortKey) : a.sortKey.localeCompare(b.sortKey))),
    }))
  }, [items, order])

  const keyOf = (m: Magazine) => `${scope}:${m.id}`

  const read = (mag: Magazine, el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    setActive(null)
    openReader(mag, keyOf(mag), { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width, rot: 0 })
  }

  return (
    <div className={`years size-${size}`}>
      {rows.map(({ year, issues }) => (
        <section className="year-row" key={year} aria-labelledby={`${scope}-${year}`}>
          <h3 id={`${scope}-${year}`}>
            <span className="year">{year}</span>
            <span className="year-count">{issues.length} sayı</span>
          </h3>
          <ul className="tiles">
            {issues.map((m) => {
              const cover = covers[m.id]
              const selected = active?.mag.id === m.id
              return (
                <li key={m.id}>
                  <button
                    className={`tile${selected ? ' is-selected' : ''}${openedKey === keyOf(m) ? ' is-away' : ''}`}
                    aria-haspopup="dialog"
                    aria-expanded={selected}
                    onClick={(e) => setActive(selected ? null : { mag: m, el: e.currentTarget })}
                  >
                    <span className="tile-cover" style={{ aspectRatio: String(cover?.ratio ?? 0.75) }}>
                      {cover ? <img src={cover.url} alt="" draggable={false} /> : <span className="spine-blank" />}
                    </span>
                    <span className="tile-title">{m.title}</span>
                    <span className="tile-issue">Sayı {String(m.issue).padStart(2, '0')}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
      {active && (
        <Popover
          mag={active.mag}
          anchor={active.el}
          onClose={() => setActive(null)}
          onRead={() => read(active.mag, active.el.querySelector('.tile-cover') as HTMLElement)}
        />
      )}
    </div>
  )
}

const W = 340

function Popover({ mag, anchor, onClose, onRead }: { mag: Magazine; anchor: HTMLElement; onClose: () => void; onRead: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ left: number; top: number; origin: string } | null>(null)
  const sheet = window.innerWidth < 640

  const place = useCallback(() => {
    const el = ref.current
    if (!el) return
    const a = anchor.getBoundingClientRect()
    const h = el.offsetHeight
    const vw = window.innerWidth
    const vh = window.innerHeight
    const gap = 14
    const right = a.right + gap + W <= vw - 12
    const left = right ? a.right + gap : Math.max(12, a.left - gap - W)
    const top = Math.min(Math.max(80, a.top + a.height / 2 - h / 2), vh - h - 12) // 80 clears the sticky header
    setPos({ left, top, origin: right ? 'left center' : 'right center' })
  }, [anchor])

  useLayoutEffect(() => {
    if (!sheet) place()
  }, [place, sheet, mag])

  useEffect(() => {
    if (sheet) return
    let raf = 0
    const onMove = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(place)
    }
    window.addEventListener('scroll', onMove, { passive: true })
    window.addEventListener('resize', onMove)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onMove)
      window.removeEventListener('resize', onMove)
    }
  }, [place, sheet])

  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        anchor.focus({ preventScroll: true })
      }
    }
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element
      if (!ref.current?.contains(t) && !t.closest('.tile')) onClose()
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [anchor, onClose])

  return createPortal(
    <div
      ref={ref}
      className={`popover${sheet ? ' is-sheet' : ''}`}
      role="dialog"
      aria-label={`${mag.title}, ${mag.issue}. sayı`}
      tabIndex={-1}
      style={sheet ? undefined : { left: pos?.left ?? -9999, top: pos?.top ?? 0, width: W, transformOrigin: pos?.origin, visibility: pos ? 'visible' : 'hidden' }}
    >
      <button className="popover-close" onClick={onClose} aria-label="Ayrıntıları kapat">
        <svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      </button>
      <h4>{mag.title}</h4>
      <p className="popover-meta">Sayı {String(mag.issue).padStart(2, '0')}, {mag.year}</p>
      <p className="popover-blurb">{mag.blurb}</p>
      {(mag.credits.editor || mag.credits.contributors.length > 0) && (
      <div className="credits">
        {mag.credits.editor && (
          <p className="credit-editor">
            <span>Editör</span>
            <strong>{mag.credits.editor}</strong>
          </p>
        )}
        {mag.credits.contributors.length > 0 && <p className="credit-label">Katkıda bulunanlar</p>}
        <ul className="contributors">
          {mag.credits.contributors.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>
      )}
      <button className="read" onClick={onRead}>Bu sayıyı oku</button>
    </div>,
    document.body,
  )
}
