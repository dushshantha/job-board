import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import './CompanyProfile.css'

function CompanyProfile() {
  const { id } = useParams()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`/api/companies/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Company not found')
        return res.json()
      })
      .then((data) => {
        setCompany(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  if (loading) return <p className="company-profile__status">Loading…</p>
  if (error) return <p className="company-profile__status company-profile__status--error">{error}</p>

  const jobs = company.jobs || []
  const openJobs = jobs.filter((j) => j.status === 'open')

  return (
    <div className="company-profile">
      {/* Hero */}
      <div className="company-profile__hero">
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt={`${company.name} logo`}
            className="company-profile__logo"
          />
        ) : (
          <div className="company-profile__logo-placeholder">
            {company.name.charAt(0)}
          </div>
        )}
        <div className="company-profile__hero-info">
          <h1 className="company-profile__name">{company.name}</h1>
          {company.location && (
            <span className="company-profile__location">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 1a5 5 0 0 1 5 5c0 3.5-5 9-5 9S3 9.5 3 6a5 5 0 0 1 5-5Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
              {company.location}
            </span>
          )}
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="company-profile__website"
            >
              {company.website}
            </a>
          )}
        </div>
      </div>

      {/* About */}
      {company.description && (
        <section className="company-profile__section">
          <h2 className="company-profile__section-title">About {company.name}</h2>
          <p className="company-profile__description">{company.description}</p>
        </section>
      )}

      {/* Open positions */}
      <section className="company-profile__section">
        <h2 className="company-profile__section-title">
          Open positions
          {openJobs.length > 0 && (
            <span className="company-profile__job-count">{openJobs.length}</span>
          )}
        </h2>

        {openJobs.length === 0 ? (
          <p className="company-profile__empty">No open positions at this time.</p>
        ) : (
          <ul className="company-profile__job-list">
            {openJobs.map((job) => (
              <li key={job.id} className="company-profile__job-card">
                <div className="company-profile__job-info">
                  <Link to={`/jobs/${job.id}`} className="company-profile__job-title">
                    {job.title}
                  </Link>
                  <div className="company-profile__job-meta">
                    {job.location && <span>{job.location}</span>}
                    {job.remote === 1 && (
                      <span className="company-profile__job-badge">Remote</span>
                    )}
                    {job.type && (
                      <span className="company-profile__job-badge">{job.type}</span>
                    )}
                    {(job.salary_min || job.salary_max) && (
                      <span>
                        {job.salary_min && job.salary_max
                          ? `$${job.salary_min.toLocaleString()} – $${job.salary_max.toLocaleString()}`
                          : job.salary_min
                          ? `From $${job.salary_min.toLocaleString()}`
                          : `Up to $${job.salary_max.toLocaleString()}`}
                      </span>
                    )}
                  </div>
                </div>
                <Link to={`/jobs/${job.id}`} className="company-profile__view-btn">
                  View →
                </Link>
              </li>
            ))}
          </ul>
        )}

        {jobs.length > openJobs.length && (
          <p className="company-profile__closed-note">
            {jobs.length - openJobs.length} position(s) currently closed.
          </p>
        )}
      </section>
    </div>
  )
}

export default CompanyProfile
