import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { PageFlip } from 'page-flip'
import type { Geo } from './Carousel'
import type { Magazine } from './data/magazines'
import { loadPdf, renderPage, type Cover } from './pdf'

type Props = { mag: Magazine; cover: Cover; geo: Geo; onClosed: () => void }

const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'

function fit(ratio: number) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const single = vw < 760
  let ph = vh * 0.8
  let pw = ph * ratio
  const room = single ? vw * 0.9 : (vw * 0.92) / 2
  if (pw > room) {
    pw = room
    ph = pw / ratio
  }
  return { pw: Math.floor(pw), ph: Math.floor(ph), single }
}

export default function Reader({ mag, cover, geo, onClosed }: Props) {
  const heroRef = useRef<HTMLDivElement>(null)
  const holderRef = useRef<HTMLDivElement>(null)
  const bookRef = useRef<PageFlip | null>(null)
  const imgs = useRef<HTMLImageElement[]>([])
  const urls = useRef<string[]>([cover.url])
  const pageRef = useRef(0)

  const [size, setSize] = useState(() => fit(cover.ratio))
  const [phase, setPhase] = useState<'in' | 'open' | 'out'>('in')
  const [total, setTotal] = useState(cover.pages % 2 ? cover.pages + 1 : cover.pages)
  const [page, setPage] = useState(0)
  const [ready, setReady] = useState(false)
  // the closed book sits on one half of the spread; slide it so a lone cover stays centred
  const [shift, setShift] = useState(0)
  const shiftFor = useCallback(
    (idx: number, book: PageFlip | null) =>
      !book || book.getOrientation() === 'portrait' ? 0 : idx === 0 ? -size.pw / 2 : idx >= total - 1 ? size.pw / 2 : 0,
    [size.pw, total],
  )

  const heroRect = useCallback(() => {
    const { pw, ph } = size
    return { left: (window.innerWidth - pw) / 2, top: (window.innerHeight - ph) / 2 }
  }, [size])

  // hero transform that places the target-sized card over the carousel item
  const originTransform = useCallback(() => {
    const r = heroRect()
    const dx = geo.cx - (r.left + size.pw / 2)
    const dy = geo.cy - (r.top + size.ph / 2)
    return `translate(${dx}px, ${dy}px) rotate(${geo.rot}deg) scale(${geo.w / size.pw})`
  }, [geo, heroRect, size])

  // fly the cover from the carousel into focus
  useLayoutEffect(() => {
    const hero = heroRef.current!
    const a = hero.animate([{ transform: originTransform() }, { transform: 'none' }], {
      duration: 720,
      easing: EASE,
      fill: 'both',
    })
    a.finished.then(() => setPhase('open')).catch(() => {})
    return () => a.cancel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // render every page in the background, cover first
  useEffect(() => {
    let dead = false
    ;(async () => {
      const doc = await loadPdf(mag.pdf)
      const h = Math.min(1800, Math.round(window.innerHeight * Math.min(window.devicePixelRatio, 2) * 0.9))
      for (let i = 1; i <= doc.numPages; i++) {
        const { url } = await renderPage(doc, i, h)
        if (dead) return URL.revokeObjectURL(url)
        // pdf page i sits at book index i-1, except the back cover after a blank filler
        const idx = doc.numPages % 2 && i === doc.numPages ? i : i - 1
        urls.current[idx] = url
        const img = imgs.current[idx]
        if (img) img.src = url
      }
    })()
    return () => {
      dead = true
    }
  }, [mag.pdf])

  // build the flipbook (again on resize)
  useEffect(() => {
    const holder = holderRef.current!
    const el = document.createElement('div')
    holder.appendChild(el)
    const count = total
    const nodes: HTMLElement[] = []
    imgs.current = []
    for (let i = 0; i < count; i++) {
      const div = document.createElement('div')
      div.className = 'sheet'
      if (i === 0 || i === count - 1) div.dataset.density = 'hard'
      const img = document.createElement('img')
      img.draggable = false
      img.alt = ''
      if (urls.current[i]) img.src = urls.current[i]
      div.appendChild(img)
      imgs.current[i] = img
      nodes.push(div)
    }
    const book = new PageFlip(el, {
      width: size.pw,
      height: size.ph,
      size: 'fixed',
      showCover: true,
      usePortrait: true,
      drawShadow: true,
      maxShadowOpacity: 0.35,
      flippingTime: 900,
      mobileScrollSupport: false,
      startPage: pageRef.current,
    })
    book.loadFromHTML(nodes)
    book.on('flip', (e) => {
      pageRef.current = e.data
      setPage(e.data)
      setShift(shiftFor(e.data, book))
    })
    book.on('changeState', (e) => {
      if (e.data !== 'flipping') return
      const c = book.getCurrentPageIndex()
      const forward = (book.getFlipController() as any).calc?.getDirection() === 0
      const to = forward ? (c === 0 ? 1 : Math.min(c + 2, count - 1)) : c >= count - 1 ? count - 3 : c <= 1 ? 0 : c - 2
      setShift(shiftFor(to, book))
    })
    bookRef.current = book
    setShift(shiftFor(pageRef.current, book))
    setReady(true)
    return () => {
      try { book.destroy() } catch { /* already gone */ }
      el.remove()
      bookRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, total])

  useEffect(() => {
    let t = 0
    const onResize = () => {
      clearTimeout(t)
      t = window.setTimeout(() => setSize(fit(cover.ratio)), 150)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [cover.ratio])

  const close = useCallback(() => {
    if (phase === 'out') return
    setPhase('out')
    const hero = heroRef.current!
    hero.animate([{ transform: 'none' }, { transform: originTransform() }], {
      duration: 620,
      easing: EASE,
      delay: 160,
      fill: 'both',
    }).finished.then(onClosed).catch(() => {})
  }, [phase, originTransform, onClosed])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (phase !== 'open') return
      if (e.key === 'ArrowRight') bookRef.current?.flipNext()
      if (e.key === 'ArrowLeft') bookRef.current?.flipPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, phase])

  // the real page count may differ from the cover's guess only by the filler page
  useEffect(() => {
    setTotal(cover.pages % 2 ? cover.pages + 1 : cover.pages)
  }, [cover.pages])

  const label =
    page === 0 ? 'Ön kapak' : page >= total - 1 ? 'Arka kapak' : `Sayfa ${page + 1}–${Math.min(page + 2, total - 1)} / ${total}`
  const r = heroRect()
  const showBook = phase === 'open' && ready

  return (
    <div className={`reader is-${phase}`} role="dialog" aria-modal="true" aria-label={`${mag.title}, ${mag.issue}. sayı`}>
      <div className="backdrop" onClick={close} />
      <div
        ref={heroRef}
        className="fly"
        style={{ left: r.left, top: r.top, width: size.pw, height: size.ph, opacity: showBook ? 0 : 1 }}
      >
        <img src={cover.url} alt="" />
      </div>
      <div
        className="book-holder"
        ref={holderRef}
        style={{ width: size.pw * 2, height: size.ph, opacity: showBook ? 1 : 0, transform: `translate(calc(-50% + ${shift}px), -50%)` }}
        onClick={(e) => e.target === e.currentTarget && close()}
      />
      <div className="reader-ui">
        <button className="close" onClick={close} aria-label="Dergiyi kapat">
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
        <div className="pager">
          <button onClick={() => bookRef.current?.flipPrev()} disabled={page === 0} aria-label="Önceki sayfa">
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <span>{mag.title}, {label}</span>
          <button onClick={() => bookRef.current?.flipNext()} disabled={page >= total - 1} aria-label="Sonraki sayfa">
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
