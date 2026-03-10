import { useState } from 'react'
import './ApplicationForm.css'

function ApplicationForm({ jobId, onClose }) {
  const [fields, setFields] = useState({
    applicant_name: '',
    applicant_email: '',
    cover_letter: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(e) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/jobs/${jobId}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Submission failed')
      }

      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="app-form app-form--success">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <circle cx="20" cy="20" r="20" fill="var(--color-success)" opacity="0.12" />
          <path d="M12 20l6 6 10-12" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <h3 className="app-form__success-title">Application submitted!</h3>
        <p className="app-form__success-msg">We'll be in touch soon.</p>
        <button className="app-form__close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    )
  }

  return (
    <div className="app-form">
      <div className="app-form__header">
        <h2 className="app-form__title">Apply for this position</h2>
        <button className="app-form__dismiss" onClick={onClose} aria-label="Cancel">
          ✕
        </button>
      </div>

      <form className="app-form__form" onSubmit={handleSubmit} noValidate>
        <div className="app-form__field">
          <label className="app-form__label" htmlFor="applicant_name">
            Full name <span aria-hidden="true">*</span>
          </label>
          <input
            id="applicant_name"
            name="applicant_name"
            type="text"
            className="app-form__input"
            placeholder="Jane Doe"
            value={fields.applicant_name}
            onChange={handleChange}
            required
            autoComplete="name"
          />
        </div>

        <div className="app-form__field">
          <label className="app-form__label" htmlFor="applicant_email">
            Email address <span aria-hidden="true">*</span>
          </label>
          <input
            id="applicant_email"
            name="applicant_email"
            type="email"
            className="app-form__input"
            placeholder="jane@example.com"
            value={fields.applicant_email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>

        <div className="app-form__field">
          <label className="app-form__label" htmlFor="cover_letter">
            Cover letter
          </label>
          <textarea
            id="cover_letter"
            name="cover_letter"
            className="app-form__textarea"
            placeholder="Tell us why you're a great fit…"
            rows={6}
            value={fields.cover_letter}
            onChange={handleChange}
          />
        </div>

        {error && <p className="app-form__error">{error}</p>}

        <div className="app-form__actions">
          <button type="button" className="app-form__cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="app-form__submit-btn" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit application'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ApplicationForm
