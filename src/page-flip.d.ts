declare module 'page-flip' {
  export class PageFlip {
    constructor(el: HTMLElement, settings: Record<string, unknown>)
    loadFromHTML(items: HTMLElement[] | NodeListOf<HTMLElement>): void
    on(event: 'flip' | 'changeState' | 'changeOrientation', cb: (e: { data: any }) => void): PageFlip
    flipNext(corner?: 'top' | 'bottom'): void
    flipPrev(corner?: 'top' | 'bottom'): void
    turnToPage(n: number): void
    getCurrentPageIndex(): number
    getFlipController(): unknown
    getPageCount(): number
    getOrientation(): 'portrait' | 'landscape'
    destroy(): void
  }
}
