import RichText from '../components/RichText'
import { useLibrary } from '../library'

const formatDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })

export default function Community() {
  const { community } = useLibrary().content
  const events = [...community.events].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="page prose">
      <h1 className="page-title">{community.title}</h1>
      <p className="page-lead">{community.lead}</p>

      {events.length > 0 && (
        <>
          <h2>{community.eventsTitle}</h2>
          <ul className="events">
            {events.map((ev) => (
              <li key={ev.title + ev.date}>
                <time dateTime={ev.date}>{formatDate(ev.date)}</time>
                <div>
                  <strong>{ev.title}</strong>
                  <span>{ev.place}</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <RichText value={community.body} />
    </div>
  )
}
