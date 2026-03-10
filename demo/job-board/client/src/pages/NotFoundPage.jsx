import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', paddingTop: 'var(--space-16)' }}>
      <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-4)' }}>
        404 — Page Not Found
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
        The page you are looking for does not exist.
      </p>
      <Link to="/" className="btn btn-primary">
        Back to Jobs
      </Link>
    </div>
  )
}

export default NotFoundPage
