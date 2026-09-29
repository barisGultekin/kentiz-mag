import SmartLink from '../components/SmartLink'
import Carousel from '../Carousel'
import YearRows from '../components/YearRows'
import { useLibrary } from '../library'

export default function Home() {
  const { content, magazines, covers, status, openedKey, openReader } = useLibrary()

  if (status !== 'ready' || !magazines.length) {
    return (
      <p className="status">
        {status === 'failed'
          ? 'Dergiler yüklenemedi. Bağlantınızı kontrol edip sayfayı yenileyin.'
          : status === 'ready'
            ? 'Henüz yayımlanmış bir sayı yok.'
            : 'Sayılar yükleniyor'}
      </p>
    )
  }

  const heroKey = openedKey?.startsWith('hero:') ? Number(openedKey.slice(5)) : null

  return (
    <>
      <section className="hero" aria-label="Öne çıkan sayılar">
        <Carousel
          items={magazines}
          covers={covers}
          hiddenKey={heroKey}
          onOpen={(mag, k, geo) => openReader(mag, `hero:${k}`, geo)}
        />
        {magazines.length > 1 && <p className="hint">{content.home.hint}</p>}
      </section>

      <section className="archive" aria-labelledby="archive-title">
        <div className="archive-head">
          <h2 id="archive-title">{content.home.archiveTitle}</h2>
          <SmartLink url="/sayilar" className="text-link">{content.home.archiveLinkLabel}</SmartLink>
        </div>
        <YearRows items={magazines} size="md" scope="home" />
      </section>
    </>
  )
}
