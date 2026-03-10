# Job Board

A full-stack job board application built with **Express + SQLite** on the backend and **React + Vite** on the frontend. Features full-text search, tag-based filtering, and an application submission flow.

## Quick Start

```bash
# Clone the repo and enter the project
git clone https://github.com/dushshantha/job-board.git
cd job-board/demo/job-board

# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..

# Seed the database with sample data
npm run seed

# Start both servers concurrently (requires bash)
bash start.sh
```

Open http://localhost:5173 in your browser.

## Manual Setup

### Backend

```bash
cd demo/job-board
npm install
npm run seed      # optional: load sample data
npm run dev       # starts API on http://localhost:3001 (with file-watch)
```

### Frontend

```bash
cd demo/job-board/client
npm install
npm run dev       # starts Vite dev server on http://localhost:5173
```

The Vite dev server proxies `/api/*` requests to the backend, so no CORS issues during development.

## Running Tests

```bash
cd demo/job-board
npm test
```

Tests use an in-memory SQLite database — no external services required. The test suite covers all API endpoints (42 tests).

## Architecture

```
demo/job-board/
├── src/
│   ├── server.js        # Express app and all route handlers
│   ├── index.js         # DB initialization entry point
│   └── db/
│       ├── db.js        # Database layer (better-sqlite3)
│       ├── schema.sql   # Table definitions + FTS5 index
│       └── seed.js      # Sample data (5 companies, 15 jobs)
├── client/              # React + Vite frontend
│   └── src/
│       ├── App.jsx      # Router
│       ├── pages/       # JobListPage, JobDetail, CompanyProfile
│       └── components/  # SearchBar, FilterBar, TagCloud, JobCard, …
├── data/                # SQLite database file (auto-created)
├── tests/
│   ├── api.test.js      # Jest + Supertest integration tests
│   └── setup.js        # Test database helpers
└── start.sh             # Automated concurrent startup script
```

### Database

Three tables: **companies** → **jobs** → **applications**, with cascading deletes.
An FTS5 virtual table (`jobs_fts`) enables fast full-text search across job titles, descriptions, and company names.

The DB file lives at `./data/job-board.db` by default. Override via the `DB_PATH` environment variable.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | API server port |
| `DB_PATH` | `./data/job-board.db` | SQLite database path (use `:memory:` for in-memory) |
| `NODE_ENV` | — | Set to `test` to disable the HTTP listener (used by tests) |

---

## API Reference

All endpoints are prefixed with `/api`. Request/response bodies use JSON.

### Companies

#### `GET /api/companies`

Returns all companies ordered alphabetically.

**Response** `200`
```json
[
  {
    "id": 1,
    "name": "Acme Corp",
    "website": "https://acme.example",
    "location": "San Francisco, CA",
    "description": "A company",
    "logo_url": null,
    "created_at": "2024-01-01 00:00:00"
  }
]
```

---

#### `GET /api/companies/:id`

Returns a single company together with its open and closed job postings.

**Response** `200`
```json
{
  "id": 1,
  "name": "Acme Corp",
  "jobs": [ { "id": 5, "title": "Senior Engineer", "…": "…" } ]
}
```

**Response** `404` — company not found

---

#### `POST /api/companies`

Creates a new company.

**Request body**
| Field | Type | Required |
|-------|------|----------|
| `name` | string | Yes |
| `website` | string | No |
| `location` | string | No |
| `description` | string | No |
| `logo_url` | string | No |

**Response** `201` — the created company object

**Response** `400` — `{ "error": "name is required" }`

---

### Jobs

#### `GET /api/jobs`

Returns job postings with optional filtering and sorting.

**Query parameters**
| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Full-text search (title, description, company name) |
| `status` | `open` \| `closed` | Filter by job status |
| `type` | `full-time` \| `part-time` \| `contract` \| `internship` | Filter by employment type |
| `remote` | `true` \| `false` | Filter remote/on-site jobs |
| `location` | string | Partial match on location |
| `company_id` | number | Filter by company |
| `tag` | string | Filter by a single tag |
| `sort` | `newest` \| `salary_desc` \| `company_asc` | Sort order (default: `newest`) |

**Response** `200` — array of job objects (each includes `company_name` and `company_logo`)

---

#### `GET /api/jobs/tags`

Returns unique tags with their occurrence counts.

**Query parameters**
| Param | Default | Description |
|-------|---------|-------------|
| `status` | `open` | Count tags from jobs with this status |

**Response** `200`
```json
[
  { "tag": "react", "count": 5 },
  { "tag": "typescript", "count": 4 }
]
```

---

#### `GET /api/jobs/:id`

Returns a single job with full company details joined.

**Response** `200` — job object including `company_name`, `company_website`, `company_location`, `company_description`, `company_logo`

**Response** `404` — job not found

---

#### `POST /api/jobs`

Creates a new job posting.

**Request body**
| Field | Type | Required | Default |
|-------|------|----------|---------|
| `company_id` | number | Yes | — |
| `title` | string | Yes | — |
| `description` | string | No | null |
| `location` | string | No | null |
| `type` | `full-time` \| `part-time` \| `contract` \| `internship` | No | `full-time` |
| `salary_min` | number | No | null |
| `salary_max` | number | No | null |
| `remote` | boolean | No | false |
| `status` | `open` \| `closed` | No | `open` |
| `tags` | string[] | No | `[]` |

**Response** `201` — the created job object

**Response** `400` — missing `company_id` or `title`

---

#### `PATCH /api/jobs/:id`

Partially updates a job. Accepts any subset of the fields listed for `POST /api/jobs` (except `company_id`).

**Response** `200` — the updated job object

**Response** `404` — job not found

---

### Applications

#### `POST /api/jobs/:id/applications`

Submits a job application.

**Request body**
| Field | Type | Required |
|-------|------|----------|
| `applicant_name` | string | Yes |
| `applicant_email` | string | Yes |
| `resume_url` | string | No |
| `cover_letter` | string | No |

**Response** `201` — the created application object (status defaults to `pending`)

**Response** `400` — missing `applicant_name` or `applicant_email`

**Response** `404` — job not found

---

#### `GET /api/jobs/:id/applications`

Returns all applications for a job, ordered by submission date (newest first).

**Response** `200` — array of application objects (each includes `job_title` and `company_name`)

**Response** `404` — job not found
