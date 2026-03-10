import { useParams } from 'react-router-dom'

function JobDetailPage() {
  const { id } = useParams()

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-4)' }}>
        Job #{id}
      </h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        Job details will appear here.
      </p>
    </div>
  )
}

export default JobDetailPage
