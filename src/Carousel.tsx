import { useCallback, useEffect, useRef, useState } from 'react'
import type { Magazine } from './data/magazines'
import type { Cover } from './pdf'

export type Geo = { cx: number; cy: number; w: number; rot: number }

type Props = {
  items: Magazine[]
  covers: Record<string, Cover | undefined>
  hiddenKey: number | null
  onOpen: (mag: Magazine, key: number, geo: Geo) => void
}

const STEP = 27 // degrees between neighbouring magazines on the arc
const COMPACT_STEP = 15 // same idea for screens under 760px, with a nearly flat arc
const rx0 = (vw: number, step: number) => (vw * 0.6) / Math.sin((step * Math.PI) / 180)
const LOOP_MIN = 7 // with fewer issues the shelf does not wrap, so no cover appears twice
const RANGE = 4 // how many magazines are rendered each side of the centre
const mod = (n: number, m: number) => ((n % m) + m) % m

export default function Carousel({ items, covers, hiddenKey, onOpen }: Props) {
  const n = items.length
  const loop = n >= LOOP_MIN
  const clampT = useCallback((v: number) => (loop ? v : Math.min(n - 1, Math.max(0, v))), [loop, n])
  const stageRef = useRef<HTMLDivElement>(null)
  const els = useRef(new Map<number, HTMLButtonElement>())
  const pos = useRef(0) // current (smoothed) position, in magazines
  const target = useRef(0)
  const raf = useRef(0)
  const drag = useRef<{ x: number; start: number; moved: number; id: number } | null>(null)
  const wheelTimer = useRef(0)
  const [center, setCenter] = useState(0)

  const geometry = useCallback((k: number) => {
    const stage = stageRef.current!
    const vw = stage.clientWidth
    const vh = stage.clientHeight
    const cardH = Math.min(vh * 0.76, 620, (vw * 0.66) / 0.75)
    const ratio = covers[items[mod(k, n)].id]?.ratio ?? 0.75
    const cardW = cardH * ratio
    // narrow screens: a much larger, flatter circle so only the centre and a sliver of each neighbour show
    const compact = vw < 760
    const step = compact ? COMPACT_STEP : STEP
    const a = (k - pos.current) * step
    const rad = (a * Math.PI) / 180
    const drop = Math.max(vh - cardH - 48, 60)
    const ry = compact ? rx0(vw, step) : drop / (1 - Math.cos((70 * Math.PI) / 180))
    const rx = compact ? rx0(vw, step) : (vw * 0.52) / Math.sin((70 * Math.PI) / 180)
    const near = Math.max(0, 1 - Math.abs(a) / step)
    return {
      a,
      cardW,
      cardH,
      x: rx * Math.sin(rad),
      y: cardH / 2 + 24 + ry * (1 - Math.cos(rad)),
      rot: a * 0.9,
      scale: 0.68 + 0.32 * near,
      opacity: Math.min(1, Math.max(0, (92 - Math.abs(k - pos.current) * STEP) / 30)),
    }
  }, [covers, items, n])

  const apply = useCallback(() => {
    if (!stageRef.current) return
    els.current.forEach((el, k) => {
      const g = geometry(k)
      el.style.width = `${g.cardW}px`
      el.style.height = `${g.cardH}px`
      el.style.transform = `translate3d(${g.x - g.cardW / 2}px, ${g.y - g.cardH / 2}px, 0) rotate(${g.rot}deg) scale(${g.scale})`
      el.style.opacity = String(g.opacity)
      el.style.zIndex = String(100 - Math.round(Math.abs(g.a)))
      el.style.pointerEvents = g.opacity < 0.05 ? 'none' : 'auto'
    })
    const c = Math.round(pos.current)
    setCenter((prev) => (prev === c ? prev : c))
  }, [geometry])

  const tick = useCallback(() => {
    const d = target.current - pos.current
    pos.current += Math.abs(d) < 0.0008 ? d : d * 0.13
    apply()
    raf.current = Math.abs(d) < 0.0008 ? 0 : requestAnimationFrame(tick)
  }, [apply])

  const kick = useCallback(() => {
    if (!raf.current) raf.current = requestAnimationFrame(tick)
  }, [tick])

  const go = useCallback(
    (delta: number) => {
      target.current = clampT(Math.round(target.current) + delta)
      kick()
    },
    [kick, clampT],
  )

  // re-apply whenever the rendered set or cover ratios change, and on resize
  useEffect(() => {
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(stageRef.current!)
    return () => ro.disconnect()
  }, [apply, center])
  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  // wheel / trackpad
  useEffect(() => {
    const el = stageRef.current!
    const onWheel = (e: WheelEvent) => {
      // vertical wheel scrolls the page; only sideways gestures move the shelf
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      e.preventDefault()
      target.current = clampT(target.current + e.deltaX / 420)
      kick()
      clearTimeout(wheelTimer.current)
      wheelTimer.current = window.setTimeout(() => {
        target.current = clampT(Math.round(target.current))
        kick()
      }, 110)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [kick, clampT])

  // keyboard
  useEffect(() => {
    if (hiddenKey !== null) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as Element).closest('input, select, textarea')) return
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, hiddenKey])

  const open = (k: number) => {
    const g = geometry(k)
    const r = stageRef.current!.getBoundingClientRect()
    onOpen(items[mod(k, n)], k, {
      cx: r.left + r.width / 2 + g.x,
      cy: r.top + g.y,
      w: g.cardW * g.scale,
      rot: g.rot,
    })
  }

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, start: target.current, moved: 0, id: e.pointerId }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const dx = e.clientX - d.x
    d.moved = Math.max(d.moved, Math.abs(dx))
    if (d.moved > 6) {
      stageRef.current!.setPointerCapture(e.pointerId)
      target.current = clampT(d.start - dx / 260)
      kick()
    }
  }
  const onPointerUp = () => {
    const d = drag.current
    drag.current = null
    if (d && d.moved > 6) {
      target.current = clampT(Math.round(target.current))
      kick()
    }
  }

  const keys = Array.from({ length: RANGE * 2 + 1 }, (_, i) => Math.round(center) - RANGE + i).filter((k) => loop || (k >= 0 && k < n))
  const mag = items[mod(center, n)]

  return (
    <section className="shelf" aria-label="Dergiler">
      <div
        className="arc"
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {keys.map((k) => {
          const m = items[mod(k, n)]
          const cover = covers[m.id]
          return (
            <button
              key={k}
              ref={(el) => {
                if (el) els.current.set(k, el)
                else els.current.delete(k)
              }}
              className={`spine${k === hiddenKey ? ' is-away' : ''}`}
              tabIndex={k === center ? 0 : -1}
              aria-label={k === center ? `${m.title}, ${m.issue}. sayıyı aç` : `${m.title}, ${m.issue}. sayıyı öne getir`}
              onClick={() => {
                if ((drag.current?.moved ?? 0) > 6) return
                if (k === center) return open(k)
                // side magazines slide to the centre first; a second click opens them
                target.current = k
                kick()
              }}
            >
              {cover ? <img src={cover.url} alt="" draggable={false} /> : <span className="spine-blank" />}
            </button>
          )
        })}
      </div>

      <div className="caption">
        <button className="nudge" onClick={() => go(-1)} aria-label="Önceki sayı" disabled={!loop && center <= 0} hidden={n < 2}>
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div className="caption-text" key={mag.id}>
          <h2>{mag.title}</h2>
          <p>{mag.blurb}</p>
          <span className="meta">Sayı {String(mag.issue).padStart(2, '0')}, {mag.date}</span>
        </div>
        <button className="nudge" onClick={() => go(1)} aria-label="Sonraki sayı" disabled={!loop && center >= n - 1} hidden={n < 2}>
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
      <button className="read" onClick={() => open(center)}>Bu sayıyı oku</button>
    </section>
  )
}
