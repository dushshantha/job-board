import './SearchBar.css'

function SearchBar({ value, onChange, placeholder = 'Search jobs by title or keyword…' }) {
  return (
    <div className="search-bar">
      <svg
        className="search-bar__icon"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="search"
        className="search-bar__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search jobs"
      />
      {value && (
        <button
          className="search-bar__clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
          type="button"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default SearchBar
