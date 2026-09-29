import YearRows from '../components/YearRows'
import { useLibrary } from '../library'

export default function Issues() {
  const { content, magazines, status } = useLibrary()

  return (
    <div className="page">
      <h1 className="page-title">{content.issues.title}</h1>
      <p className="page-lead">{content.issues.lead}</p>
      {status === 'ready' && <YearRows items={magazines} size="lg" scope="issues" />}
    </div>
  )
}
