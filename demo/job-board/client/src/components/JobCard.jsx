import { Link } from 'react-router-dom'
import './JobCard.css'

const TYPE_LABELS = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
}

function formatSalary(min, max) {
  if (!min && !max) return null
  const fmt = (n) =>
    n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  return `Up to ${fmt(max)}`
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

function CompanyLogo({ name, logoUrl }) {
  if (logoUrl) {
    return <img src={logoUrl} alt={name} className="job-card__logo" />
  }
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  return (
    <div className="job-card__logo job-card__logo--placeholder" aria-hidden="true">
      {initials}
    </div>
  )
}

function JobCard({ job }) {
  const salary = formatSalary(job.salary_min, job.salary_max)

  return (
    <article className="job-card">
      <div className="job-card__header">
        <CompanyLogo name={job.company_name} logoUrl={job.company_logo} />
        <div className="job-card__meta">
          <span className="job-card__company">{job.company_name}</span>
          {job.created_at && (
            <span className="job-card__date">{timeAgo(job.created_at)}</span>
          )}
        </div>
      </div>

      <h2 className="job-card__title">
        <Link to={`/jobs/${job.id}`} className="job-card__title-link">
          {job.title}
        </Link>
      </h2>

      <div className="job-card__details">
        {job.location && (
          <span className="job-card__detail">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {job.location}
          </span>
        )}
        {salary && (
          <span className="job-card__detail">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            {salary}
          </span>
        )}
      </div>

      <div className="job-card__tags">
        {job.type && (
          <span className="job-card__tag">
            {TYPE_LABELS[job.type] ?? job.type}
          </span>
        )}
        {job.remote === 1 || job.remote === true ? (
          <span className="job-card__tag job-card__tag--remote">Remote</span>
        ) : null}
      </div>
    </article>
  )
}

export default JobCard
