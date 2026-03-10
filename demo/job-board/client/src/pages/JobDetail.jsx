import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ApplicationForm from '../components/ApplicationForm'
import './JobDetail.css'

function JobDetail() {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Job not found')
        return res.json()
      })
      .then((data) => {
        setJob(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  if (loading) return <p className="job-detail__status">Loading…</p>
  if (error) return <p className="job-detail__status job-detail__status--error">{error}</p>

  const tags = job.tags ? job.tags.split(',').map((t) => t.trim()).filter(Boolean) : []

  return (
    <div className="job-detail">
      {/* Header */}
      <div className="job-detail__header">
        {job.company_logo && (
          <img
            src={job.company_logo}
            alt={`${job.company_name} logo`}
            className="job-detail__company-logo"
          />
        )}
        <div className="job-detail__header-info">
          <h1 className="job-detail__title">{job.title}</h1>
          <Link to={`/companies/${job.company_id}`} className="job-detail__company-link">
            {job.company_name}
          </Link>
          {job.company_location && (
            <span className="job-detail__company-location">{job.company_location}</span>
          )}
        </div>
      </div>

      {/* Job specifics */}
      <div className="job-detail__meta">
        {job.location && (
          <span className="job-detail__meta-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 1a5 5 0 0 1 5 5c0 3.5-5 9-5 9S3 9.5 3 6a5 5 0 0 1 5-5Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
            {job.location}
          </span>
        )}
        {job.remote === 1 && (
          <span className="job-detail__meta-item job-detail__meta-item--badge">Remote</span>
        )}
        {job.type && (
          <span className="job-detail__meta-item job-detail__meta-item--badge">{job.type}</span>
        )}
        {(job.salary_min || job.salary_max) && (
          <span className="job-detail__meta-item">
            {job.salary_min && job.salary_max
              ? `$${job.salary_min.toLocaleString()} – $${job.salary_max.toLocaleString()}`
              : job.salary_min
              ? `From $${job.salary_min.toLocaleString()}`
              : `Up to $${job.salary_max.toLocaleString()}`}
          </span>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="job-detail__tags">
          {tags.map((tag) => (
            <span key={tag} className="job-detail__tag">{tag}</span>
          ))}
        </div>
      )}

      {/* Description */}
      <section className="job-detail__section">
        <h2 className="job-detail__section-title">About the role</h2>
        <div className="job-detail__description">
          {job.description
            ? job.description.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))
            : <p className="job-detail__no-content">No description provided.</p>
          }
        </div>
      </section>

      {/* Company info */}
      <section className="job-detail__section">
        <h2 className="job-detail__section-title">About the company</h2>
        <div className="job-detail__company-card">
          <Link to={`/companies/${job.company_id}`} className="job-detail__company-card-name">
            {job.company_name}
          </Link>
          {job.company_website && (
            <a
              href={job.company_website}
              target="_blank"
              rel="noopener noreferrer"
              className="job-detail__company-website"
            >
              {job.company_website}
            </a>
          )}
          {job.company_description && (
            <p className="job-detail__company-desc">{job.company_description}</p>
          )}
        </div>
      </section>

      {/* Apply Now section */}
      <section className="job-detail__apply">
        {!showForm ? (
          <button className="job-detail__apply-btn" onClick={() => setShowForm(true)}>
            Apply Now
          </button>
        ) : (
          <ApplicationForm jobId={id} onClose={() => setShowForm(false)} />
        )}
      </section>
    </div>
  )
}

export default JobDetail
