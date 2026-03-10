import { useState, useEffect, useCallback, useMemo } from 'react'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'
import JobCard from '../components/JobCard'
import './JobListings.css'

function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-card__header">
        <div className="skeleton skeleton--logo" />
        <div className="skeleton-card__meta">
          <div className="skeleton skeleton--text skeleton--text-sm" />
          <div className="skeleton skeleton--text skeleton--text-xs" />
        </div>
      </div>
      <div className="skeleton skeleton--text skeleton--text-lg" />
      <div className="skeleton skeleton--text skeleton--text-md" />
      <div className="skeleton-card__tags">
        <div className="skeleton skeleton--tag" />
        <div className="skeleton skeleton--tag" />
      </div>
    </div>
  )
}

function JobListings() {
  const [allJobs, setAllJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ type: '', remote: '', location: '' })

  const debouncedSearch = useDebounce(search)
  const debouncedLocation = useDebounce(filters.location)

  const fetchJobs = useCallback(async (params) => {
    setLoading(true)
    setError(null)
    try {
      const query = new URLSearchParams()
      if (params.search) query.set('search', params.search)
      if (params.location) query.set('location', params.location)
      if (params.remote !== '') query.set('remote', params.remote)
      query.set('status', 'open')

      const res = await fetch(`/api/jobs?${query}`)
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      setAllJobs(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJobs({
      search: debouncedSearch,
      location: debouncedLocation,
      remote: filters.remote,
    })
  }, [debouncedSearch, debouncedLocation, filters.remote, fetchJobs])

  // Client-side type filter (API doesn't expose type param)
  const jobs = useMemo(() => {
    if (!filters.type) return allJobs
    return allJobs.filter((j) => j.type === filters.type)
  }, [allJobs, filters.type])

  // Derive unique locations from loaded jobs for dropdown
  const locations = useMemo(() => {
    const locs = [...new Set(allJobs.map((j) => j.location).filter(Boolean))].sort()
    return locs
  }, [allJobs])

  return (
    <div className="job-listings">
      <div className="job-listings__hero">
        <h1 className="job-listings__heading">Find your next opportunity</h1>
        <p className="job-listings__subheading">
          Browse open roles from top companies
        </p>
        <SearchBar value={search} onChange={setSearch} />
      </div>

      <div className="job-listings__toolbar">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          locations={locations}
        />
        {!loading && !error && (
          <span className="job-listings__count">
            {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
          </span>
        )}
      </div>

      {error && (
        <div className="job-listings__error" role="alert">
          <strong>Failed to load jobs.</strong> {error}
          <button
            type="button"
            className="btn btn-outline"
            style={{ marginLeft: 'var(--space-4)' }}
            onClick={() =>
              fetchJobs({
                search: debouncedSearch,
                location: debouncedLocation,
                remote: filters.remote,
              })
            }
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="job-listings__grid" aria-busy="true" aria-label="Loading jobs">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !error && jobs.length === 0 ? (
        <div className="job-listings__empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <p>No jobs match your search.</p>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setSearch('')
              setFilters({ type: '', remote: '', location: '' })
            }}
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="job-listings__grid">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}

export default JobListings
