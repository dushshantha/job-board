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

  return db;
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
  findAll({ status, company_id } = {}) {
    let sql = 'SELECT j.*, c.name AS company_name FROM jobs j JOIN companies c ON j.company_id = c.id';
    const conditions = [];
    const params = [];
    if (status) { conditions.push('j.status = ?'); params.push(status); }
    if (company_id) { conditions.push('j.company_id = ?'); params.push(company_id); }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY j.created_at DESC';
    return getDb().prepare(sql).all(...params);
  },

  findById(id) {
    return getDb()
      .prepare('SELECT j.*, c.name AS company_name FROM jobs j JOIN companies c ON j.company_id = c.id WHERE j.id = ?')
      .get(id);
  },

  create({
    company_id, title,
    description = null, location = null,
    type = 'full-time', salary_min = null, salary_max = null,
    remote = false, status = 'open',
  }) {
    const result = getDb()
      .prepare(`
        INSERT INTO jobs (company_id, title, description, location, type, salary_min, salary_max, remote, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(company_id, title, description, location, type, salary_min, salary_max, remote ? 1 : 0, status);
    return jobs.findById(result.lastInsertRowid);
  },

  update(id, fields) {
    const allowed = ['title', 'description', 'location', 'type', 'salary_min', 'salary_max', 'remote', 'status'];
    const keys = Object.keys(fields).filter(k => allowed.includes(k));
    if (!keys.length) return jobs.findById(id);
    const setClauses = [...keys.map(k => `${k} = ?`), 'updated_at = CURRENT_TIMESTAMP'].join(', ');
    const values = keys.map(k => k === 'remote' ? (fields[k] ? 1 : 0) : fields[k]);
    getDb().prepare(`UPDATE jobs SET ${setClauses} WHERE id = ?`).run(...values, id);
    return jobs.findById(id);
  },

  delete(id) {
    return getDb().prepare('DELETE FROM jobs WHERE id = ?').run(id);
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
