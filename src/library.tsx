import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Geo } from './Carousel'
import Reader from './Reader'
import { fetchContent, type SiteContent } from './data/content'
import { defaultContent } from './data/defaults'
import { fetchMagazines, type Magazine } from './data/magazines'
import { loadCover, type Cover } from './pdf'

type Opened = { mag: Magazine; key: string; geo: Geo }

type Library = {
  content: SiteContent
  magazines: Magazine[]
  covers: Record<string, Cover | undefined>
  status: 'loading' | 'ready' | 'failed'
  /** key of the element the reader flew out of; that element hides itself meanwhile */
  openedKey: string | null
  openReader: (mag: Magazine, key: string, geo: Geo) => void
}

const Ctx = createContext<Library>(null!)
export const useLibrary = () => useContext(Ctx)

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [magazines, setMagazines] = useState<Magazine[]>([])
  const [covers, setCovers] = useState<Record<string, Cover | undefined>>({})
  const [status, setStatus] = useState<Library['status']>('loading')
  const [opened, setOpened] = useState<Opened | null>(null)
  const [content, setContent] = useState<SiteContent | null>(null)

  useEffect(() => {
    fetchContent().then(setContent)
  }, [])

  // browser tab title and description come from the CMS too
  useEffect(() => {
    if (!content) return
    document.title = content.settings.siteTitle
    document.querySelector('meta[name="description"]')?.setAttribute('content', content.settings.siteDescription)
  }, [content])

  useEffect(() => {
    fetchMagazines()
      .then((list) => {
        setMagazines(list)
        setStatus('ready')
        list.forEach((m) =>
          loadCover(m.pdf)
            .then((c) => setCovers((prev) => ({ ...prev, [m.id]: c })))
            .catch(() => {}),
        )
      })
      .catch(() => setStatus('failed'))
  }, [])

  // the reader flies back to a viewport position, so the page must not scroll under it
  useEffect(() => {
    if (!opened) return
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [opened])

  const openReader = useCallback((mag: Magazine, key: string, geo: Geo) => setOpened({ mag, key, geo }), [])
  const value = useMemo(
    () => ({ content: content ?? defaultContent, magazines, covers, status, openedKey: opened?.key ?? null, openReader }),
    [content, magazines, covers, status, opened, openReader],
  )

  return (
    <Ctx.Provider value={value}>
      {content && children /* wait for the text so the page never flashes the fallback */}
      {opened && covers[opened.mag.id] && (
        <Reader mag={opened.mag} cover={covers[opened.mag.id]!} geo={opened.geo} onClosed={() => setOpened(null)} />
      )}
    </Ctx.Provider>
  )
}
