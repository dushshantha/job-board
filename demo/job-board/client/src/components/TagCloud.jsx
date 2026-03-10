import './TagCloud.css'

function TagCloud({ tags = [], activeTag = '', onTagClick }) {
  if (tags.length === 0) return null

  const maxCount = Math.max(...tags.map((t) => t.count), 1)

  return (
    <div className="tag-cloud" role="region" aria-label="Filter by skill tag">
      <span className="tag-cloud__label">Skills</span>
      <div className="tag-cloud__tags">
        {tags.map(({ tag, count }) => {
          const weight = count / maxCount
          const isActive = activeTag === tag
          return (
            <button
              key={tag}
              type="button"
              className={[
                'tag-cloud__tag',
                isActive ? 'tag-cloud__tag--active' : '',
                weight >= 0.7 ? 'tag-cloud__tag--lg' : weight >= 0.4 ? 'tag-cloud__tag--md' : '',
              ]
                .join(' ')
                .trim()}
              onClick={() => onTagClick(isActive ? '' : tag)}
              aria-pressed={isActive}
              title={`${count} ${count === 1 ? 'job' : 'jobs'}`}
            >
              {tag}
              <span className="tag-cloud__count">{count}</span>
            </button>
          )
        })}
      </div>
      {activeTag && (
        <button
          type="button"
          className="tag-cloud__clear"
          onClick={() => onTagClick('')}
        >
          Clear tag
        </button>
      )}
    </div>
  )
}

export default TagCloud
