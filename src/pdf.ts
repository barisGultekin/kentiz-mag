import * as pdfjs from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

const docs = new Map<string, Promise<PDFDocumentProxy>>()

export function loadPdf(url: string) {
  let p = docs.get(url)
  if (!p) {
    p = pdfjs.getDocument({ url }).promise
    docs.set(url, p)
  }
  return p
}

/** Renders one page (1-based) to an object URL, `height` px tall. */
export async function renderPage(doc: PDFDocumentProxy, n: number, height: number) {
  const page = await doc.getPage(n)
  const base = page.getViewport({ scale: 1 })
  const viewport = page.getViewport({ scale: height / base.height })
  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  await page.render({ canvas, viewport }).promise
  const blob = await new Promise<Blob>((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error('render failed'))), 'image/jpeg', 0.92),
  )
  return { url: URL.createObjectURL(blob), ratio: base.width / base.height }
}

export type Cover = { url: string; ratio: number; pages: number }

const covers = new Map<string, Promise<Cover>>()

export function loadCover(pdfUrl: string) {
  let p = covers.get(pdfUrl)
  if (!p) {
    p = loadPdf(pdfUrl).then(async (doc) => {
      const { url, ratio } = await renderPage(doc, 1, 1000)
      return { url, ratio, pages: doc.numPages }
    })
    covers.set(pdfUrl, p)
  }
  return p
}
