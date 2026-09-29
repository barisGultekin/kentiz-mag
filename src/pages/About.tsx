import RichText from '../components/RichText'
import { useLibrary } from '../library'

export default function About() {
  const { about } = useLibrary().content
  return (
    <div className="page prose">
      <h1 className="page-title">{about.title}</h1>
      <p className="page-lead">{about.lead}</p>
      <RichText value={about.body} />
    </div>
  )
}
