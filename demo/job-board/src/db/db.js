import Database from 'better-sqlite3';
import { readFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DB_PATH = process.env.DB_PATH || join(__dirname, '..', '..', 'data', 'job-board.db');

let db;

/**
 * Initialize the database: open connection and run schema migrations.
 * Call this once at application startup.
 */
export function initDb() {
  mkdirSync(dirname(DB_PATH), { recursive: true });

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);

  // Add tags column to jobs if it doesn't exist (migration for existing DBs)
  const cols = db.prepare("PRAGMA table_info(jobs)").all();
  if (!cols.find(c => c.name === 'tags')) {
    db.exec("ALTER TABLE jobs ADD COLUMN tags TEXT NOT NULL DEFAULT '[]'");
  }

  // Populate FTS index from existing data on startup
  _rebuildFts();

  return db;
}

/**
 * Rebuild the FTS5 index from the current jobs table.
 * Uses a contentless FTS table so we manage the index manually.
 */
function _rebuildFts() {
  const database = getDb();
  // Delete all existing FTS rows
  database.exec("DELETE FROM jobs_fts");
  // Re-insert all jobs
  const allJobs = database.prepare(`
    SELECT j.rowid, j.title, j.description, c.name AS company_name
    FROM jobs j
    JOIN companies c ON j.company_id = c.id
  `).all();

  const insert = database.prepare(
    "INSERT INTO jobs_fts(rowid, title, description, company_name) VALUES (?, ?, ?, ?)"
  );
  const insertMany = database.transaction((rows) => {
    for (const row of rows) {
      insert.run(row.rowid, row.title || '', row.description || '', row.company_name || '');
    }
  });
  insertMany(allJobs);
}

/**
 * Return the active database instance (must call initDb() first).
 */
export function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

// ---------------------------------------------------------------------------
// Companies
// ---------------------------------------------------------------------------

export const companies = {
  findAll() {
    return getDb().prepare('SELECT * FROM companies ORDER BY name').all();
  },

  findById(id) {
    return getDb().prepare('SELECT * FROM companies WHERE id = ?').get(id);
  },

  create({ name, website = null, location = null, description = null, logo_url = null }) {
    const result = getDb()
      .prepare('INSERT INTO companies (name, website, location, description, logo_url) VALUES (?, ?, ?, ?, ?)')
      .run(name, website, location, description, logo_url);
    return companies.findById(result.lastInsertRowid);
  },

  update(id, fields) {
    const allowed = ['name', 'website', 'location', 'description', 'logo_url'];
    const keys = Object.keys(fields).filter(k => allowed.includes(k));
    if (!keys.length) return companies.findById(id);
    const setClauses = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => fields[k]);
    getDb().prepare(`UPDATE companies SET ${setClauses} WHERE id = ?`).run(...values, id);
    return companies.findById(id);
  },

  delete(id) {
    return getDb().prepare('DELETE FROM companies WHERE id = ?').run(id);
  },
};

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export const jobs = {
  findAll({ status, company_id, search, location, remote, sort, tag } = {}) {
    const database = getDb();
    const conditions = [];
    const params = [];

    let usesFts = false;
    let ftsIds = null;

    // FTS5 full-text search
    if (search && search.trim()) {
      usesFts = true;
      // Escape special FTS5 characters
      const ftsQuery = search.trim().replace(/["*]/g, '') + '*';
      try {
        ftsIds = database.prepare(
          "SELECT rowid FROM jobs_fts WHERE jobs_fts MATCH ?"
        ).all(ftsQuery).map(r => r.rowid);
      } catch {
        // Fall back to LIKE if FTS query is invalid
        ftsIds = null;
        usesFts = false;
      }

      if (usesFts) {
        if (ftsIds.length === 0) return [];
        conditions.push(`j.id IN (${ftsIds.map(() => '?').join(',')})`);
        params.push(...ftsIds);
      } else {
        conditions.push('(j.title LIKE ? OR j.description LIKE ? OR c.name LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
    }

    if (status) { conditions.push('j.status = ?'); params.push(status); }
    if (company_id) { conditions.push('j.company_id = ?'); params.push(Number(company_id)); }
    if (location) { conditions.push('j.location LIKE ?'); params.push(`%${location}%`); }
    if (remote !== undefined && remote !== '') {
      conditions.push('j.remote = ?');
      params.push(remote === true || remote === 'true' ? 1 : 0);
    }
    if (tag) {
      // JSON array contains tag (SQLite json_each approach)
      conditions.push(
        "EXISTS (SELECT 1 FROM json_each(j.tags) WHERE json_each.value = ?)"
      );
      params.push(tag);
    }

    let sql = `
      SELECT j.*, c.name AS company_name, c.logo_url AS company_logo
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
    `;
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');

    // Sorting
    switch (sort) {
      case 'salary_desc':
        sql += ' ORDER BY COALESCE(j.salary_max, j.salary_min, 0) DESC, j.created_at DESC';
        break;
      case 'company_asc':
        sql += ' ORDER BY c.name ASC, j.created_at DESC';
        break;
      case 'newest':
      default:
        sql += ' ORDER BY j.created_at DESC';
    }

    const rows = database.prepare(sql).all(...params);
    return rows.map(r => ({ ...r, tags: JSON.parse(r.tags || '[]') }));
  },

  findById(id) {
    const row = getDb()
      .prepare(`
        SELECT j.*, c.name AS company_name, c.website AS company_website,
               c.location AS company_location, c.description AS company_description,
               c.logo_url AS company_logo
        FROM jobs j
        JOIN companies c ON j.company_id = c.id
        WHERE j.id = ?
      `)
      .get(id);
    if (!row) return null;
    return { ...row, tags: JSON.parse(row.tags || '[]') };
  },

  create({
    company_id, title,
    description = null, location = null,
    type = 'full-time', salary_min = null, salary_max = null,
    remote = false, status = 'open', tags = [],
  }) {
    const database = getDb();
    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);
    const result = database
      .prepare(`
        INSERT INTO jobs (company_id, title, description, location, type, salary_min, salary_max, remote, status, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(company_id, title, description, location, type, salary_min, salary_max, remote ? 1 : 0, status, tagsJson);

    // Update FTS index
    const company = companies.findById(company_id);
    database.prepare(
      "INSERT INTO jobs_fts(rowid, title, description, company_name) VALUES (?, ?, ?, ?)"
    ).run(result.lastInsertRowid, title || '', description || '', company?.name || '');

    return jobs.findById(result.lastInsertRowid);
  },

  update(id, fields) {
    const allowed = ['title', 'description', 'location', 'type', 'salary_min', 'salary_max', 'remote', 'status', 'tags'];
    const keys = Object.keys(fields).filter(k => allowed.includes(k));
    if (!keys.length) return jobs.findById(id);

    const processedFields = { ...fields };
    if ('tags' in processedFields) {
      processedFields.tags = JSON.stringify(
        Array.isArray(processedFields.tags) ? processedFields.tags : []
      );
    }
    if ('remote' in processedFields) {
      processedFields.remote = processedFields.remote ? 1 : 0;
    }

    const setClauses = [...keys.map(k => `${k} = ?`), 'updated_at = CURRENT_TIMESTAMP'].join(', ');
    const values = keys.map(k => processedFields[k]);
    getDb().prepare(`UPDATE jobs SET ${setClauses} WHERE id = ?`).run(...values, id);

    // Update FTS index
    const updated = jobs.findById(id);
    if (updated) {
      const database = getDb();
      database.prepare("DELETE FROM jobs_fts WHERE rowid = ?").run(id);
      database.prepare(
        "INSERT INTO jobs_fts(rowid, title, description, company_name) VALUES (?, ?, ?, ?)"
      ).run(id, updated.title || '', updated.description || '', updated.company_name || '');
    }

    return updated;
  },

  delete(id) {
    getDb().prepare("DELETE FROM jobs_fts WHERE rowid = ?").run(id);
    return getDb().prepare('DELETE FROM jobs WHERE id = ?').run(id);
  },

  /**
   * Returns all unique tags with their occurrence counts across open jobs.
   */
  allTags({ status } = {}) {
    const database = getDb();
    let sql = `
      SELECT json_each.value AS tag, COUNT(*) AS count
      FROM jobs j, json_each(j.tags)
    `;
    if (status) sql += ' WHERE j.status = ?';
    sql += ' GROUP BY json_each.value ORDER BY count DESC, json_each.value ASC';

    const params = status ? [status] : [];
    return database.prepare(sql).all(...params);
  },
};

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------

export const applications = {
  findAll({ job_id, status } = {}) {
    let sql = `
      SELECT a.*, j.title AS job_title, c.name AS company_name
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN companies c ON j.company_id = c.id
    `;
    const conditions = [];
    const params = [];
    if (job_id) { conditions.push('a.job_id = ?'); params.push(job_id); }
    if (status) { conditions.push('a.status = ?'); params.push(status); }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY a.created_at DESC';
    return getDb().prepare(sql).all(...params);
  },

  findById(id) {
    return getDb()
      .prepare(`
        SELECT a.*, j.title AS job_title, c.name AS company_name
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        WHERE a.id = ?
      `)
      .get(id);
  },

  create({
    job_id, applicant_name, applicant_email,
    resume_url = null, cover_letter = null,
  }) {
    const result = getDb()
      .prepare(`
        INSERT INTO applications (job_id, applicant_name, applicant_email, resume_url, cover_letter)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(job_id, applicant_name, applicant_email, resume_url, cover_letter);
    return applications.findById(result.lastInsertRowid);
  },

  update(id, fields) {
    const allowed = ['applicant_name', 'applicant_email', 'resume_url', 'cover_letter', 'status'];
    const keys = Object.keys(fields).filter(k => allowed.includes(k));
    if (!keys.length) return applications.findById(id);
    const setClauses = [...keys.map(k => `${k} = ?`), 'updated_at = CURRENT_TIMESTAMP'].join(', ');
    const values = keys.map(k => fields[k]);
    getDb().prepare(`UPDATE applications SET ${setClauses} WHERE id = ?`).run(...values, id);
    return applications.findById(id);
  },

  delete(id) {
    return getDb().prepare('DELETE FROM applications WHERE id = ?').run(id);
  },
};
