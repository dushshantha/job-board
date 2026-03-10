import { useState, useEffect, useCallback, useMemo } from 'react'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'
import JobCard from '../components/JobCard'
import TagCloud from '../components/TagCloud'
import './JobListPage.css'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'salary_desc', label: 'Salary (high to low)' },
  { value: 'company_asc', label: 'Company (A–Z)' },
]

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

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="job-list__empty" role="status">
      <svg
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="job-list__empty-icon"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        {hasFilters && (
          <>
            <line x1="8" y1="8" x2="14" y2="14" />
            <line x1="14" y1="8" x2="8" y2="14" />
          </>
        )}
      </svg>
      <p className="job-list__empty-title">
        {hasFilters ? 'No jobs match your filters' : 'No open positions right now'}
      </p>
      <p className="job-list__empty-body">
        {hasFilters
          ? 'Try broadening your search or removing some filters.'
          : 'Check back soon — new roles are posted regularly.'}
      </p>
      {hasFilters && (
        <button type="button" className="btn btn-outline" onClick={onClear}>
          Clear all filters
        </button>
      )}
    </div>
  )
}

function JobListPage() {
  const [allJobs, setAllJobs] = useState([])
  const [availableTags, setAvailableTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ type: '', remote: '', location: '' })
  const [sort, setSort] = useState('newest')
  const [activeTag, setActiveTag] = useState('')

  const debouncedSearch = useDebounce(search)
  const debouncedLocation = useDebounce(filters.location)

  // Fetch available tags once on mount
  useEffect(() => {
    fetch('/api/jobs/tags?status=open')
      .then((r) => r.ok ? r.json() : [])
      .then(setAvailableTags)
      .catch(() => {})
  }, [])

  const fetchJobs = useCallback(async (params) => {
    setLoading(true)
    setError(null)
    try {
      const query = new URLSearchParams()
      if (params.search) query.set('search', params.search)
      if (params.location) query.set('location', params.location)
      if (params.remote !== '') query.set('remote', params.remote)
      if (params.tag) query.set('tag', params.tag)
      if (params.sort) query.set('sort', params.sort)
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
      tag: activeTag,
      sort,
    })
  }, [debouncedSearch, debouncedLocation, filters.remote, activeTag, sort, fetchJobs])

  // Client-side type filter
  const jobs = useMemo(() => {
    if (!filters.type) return allJobs
    return allJobs.filter((j) => j.type === filters.type)
  }, [allJobs, filters.type])

  // Derive unique locations from loaded jobs
  const locations = useMemo(() => {
    const locs = [...new Set(allJobs.map((j) => j.location).filter(Boolean))].sort()
    return locs
  }, [allJobs])

  const hasFilters = Boolean(
    search || filters.type || filters.remote || filters.location || activeTag
  )

  function clearAll() {
    setSearch('')
    setFilters({ type: '', remote: '', location: '' })
    setActiveTag('')
    setSort('newest')
  }

  return (
    <div className="job-list">
      <div className="job-list__hero">
        <h1 className="job-list__heading">Find your next opportunity</h1>
        <p className="job-list__subheading">Browse open roles from top companies</p>
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {availableTags.length > 0 && (
        <TagCloud
          tags={availableTags}
          activeTag={activeTag}
          onTagClick={setActiveTag}
        />
      )}

      <div className="job-list__toolbar">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          locations={locations}
        />
        <div className="job-list__toolbar-right">
          <label className="job-list__sort-label" htmlFor="sort-select">
            Sort:
          </label>
          <select
            id="sort-select"
            className="job-list__sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort jobs"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {!loading && !error && (
            <span className="job-list__count">
              {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="job-list__error" role="alert">
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
                tag: activeTag,
                sort,
              })
            }
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="job-list__grid" aria-busy="true" aria-label="Loading jobs">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !error && jobs.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onClear={clearAll} />
      ) : (
        <div className="job-list__grid">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              activeTag={activeTag}
              onTagClick={setActiveTag}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default JobListPage
