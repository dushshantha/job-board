-- Job Board Database Schema

CREATE TABLE IF NOT EXISTS companies (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  website     TEXT,
  location    TEXT,
  description TEXT,
  logo_url    TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id  INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  location    TEXT,
  type        TEXT CHECK(type IN ('full-time', 'part-time', 'contract', 'internship')) DEFAULT 'full-time',
  salary_min  INTEGER,
  salary_max  INTEGER,
  remote      INTEGER NOT NULL DEFAULT 0,  -- 0 = false, 1 = true
  status      TEXT CHECK(status IN ('open', 'closed')) DEFAULT 'open',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id          INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_name  TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  resume_url      TEXT,
  cover_letter    TEXT,
  status          TEXT CHECK(status IN ('pending', 'reviewed', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status     ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_email  ON applications(applicant_email);
