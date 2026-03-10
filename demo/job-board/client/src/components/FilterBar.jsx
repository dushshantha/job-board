import './FilterBar.css'

const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
]

function FilterBar({ filters, onChange, locations = [] }) {
  function toggle(key, value) {
    if (key === 'type') {
      const next = filters.type === value ? '' : value
      onChange({ ...filters, type: next })
    } else if (key === 'remote') {
      onChange({ ...filters, remote: filters.remote === value ? '' : value })
    } else {
      onChange({ ...filters, [key]: value })
    }
  }

  const hasActiveFilters =
    filters.type || filters.remote || filters.location

  return (
    <div className="filter-bar">
      <div className="filter-bar__group">
        <span className="filter-bar__label">Type</span>
        <div className="filter-bar__chips">
          {JOB_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              className={[
                'filter-bar__chip',
                filters.type === t.value ? 'filter-bar__chip--active' : '',
              ]
                .join(' ')
                .trim()}
              onClick={() => toggle('type', t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-bar__group">
        <span className="filter-bar__label">Remote</span>
        <div className="filter-bar__chips">
          <button
            type="button"
            className={[
              'filter-bar__chip',
              filters.remote === 'true' ? 'filter-bar__chip--active' : '',
            ]
              .join(' ')
              .trim()}
            onClick={() => toggle('remote', 'true')}
          >
            Remote
          </button>
          <button
            type="button"
            className={[
              'filter-bar__chip',
              filters.remote === 'false' ? 'filter-bar__chip--active' : '',
            ]
              .join(' ')
              .trim()}
            onClick={() => toggle('remote', 'false')}
          >
            On-site
          </button>
        </div>
      </div>

      {locations.length > 0 && (
        <div className="filter-bar__group">
          <span className="filter-bar__label">Location</span>
          <select
            className="filter-bar__select"
            value={filters.location}
            onChange={(e) => onChange({ ...filters, location: e.target.value })}
            aria-label="Filter by location"
          >
            <option value="">All locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      )}

      {hasActiveFilters && (
        <button
          type="button"
          className="filter-bar__clear-all"
          onClick={() => onChange({ type: '', remote: '', location: '' })}
        >
          Clear filters
        </button>
      )}
    </div>
  )
}

export default FilterBar
