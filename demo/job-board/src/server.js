import express from 'express';
import cors from 'cors';
import { initDb, companies, jobs, applications, getDb } from './db/db.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize DB
initDb();

// ---------------------------------------------------------------------------
// Companies
// ---------------------------------------------------------------------------

// GET /api/companies — list all companies
app.get('/api/companies', (req, res) => {
  try {
    const rows = companies.findAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/companies/:id — get company with related jobs
app.get('/api/companies/:id', (req, res) => {
  try {
    const company = companies.findById(Number(req.params.id));
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const relatedJobs = jobs.findAll({ company_id: company.id });
    res.json({ ...company, jobs: relatedJobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/companies — create a company
app.post('/api/companies', (req, res) => {
  try {
    const { name, website, location, description, logo_url } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const company = companies.create({ name, website, location, description, logo_url });
    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

// GET /api/jobs — list jobs with optional filtering
// Query params: search, location, remote (true/false), status, company_id
app.get('/api/jobs', (req, res) => {
  try {
    const { search, location, remote, status, company_id } = req.query;

    // Build dynamic query with all supported filters
    let sql = `
      SELECT j.*, c.name AS company_name, c.logo_url AS company_logo
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
    `;
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('j.status = ?');
      params.push(status);
    }
    if (company_id) {
      conditions.push('j.company_id = ?');
      params.push(Number(company_id));
    }
    if (location) {
      conditions.push('j.location LIKE ?');
      params.push(`%${location}%`);
    }
    if (remote !== undefined) {
      conditions.push('j.remote = ?');
      params.push(remote === 'true' ? 1 : 0);
    }
    if (search) {
      conditions.push('(j.title LIKE ? OR j.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY j.created_at DESC';

    const rows = getDb().prepare(sql).all(...params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/jobs/:id — get a single job with company details
app.get('/api/jobs/:id', (req, res) => {
  try {
    const job = getDb()
      .prepare(`
        SELECT j.*, c.name AS company_name, c.website AS company_website,
               c.location AS company_location, c.description AS company_description,
               c.logo_url AS company_logo
        FROM jobs j
        JOIN companies c ON j.company_id = c.id
        WHERE j.id = ?
      `)
      .get(Number(req.params.id));

    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/jobs — create a job posting
app.post('/api/jobs', (req, res) => {
  try {
    const {
      company_id, title, description, location,
      type, salary_min, salary_max, remote, status,
    } = req.body;

    if (!company_id) return res.status(400).json({ error: 'company_id is required' });
    if (!title) return res.status(400).json({ error: 'title is required' });

    const job = jobs.create({
      company_id, title, description, location,
      type, salary_min, salary_max, remote, status,
    });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------

// POST /api/jobs/:id/applications — submit an application for a job
app.post('/api/jobs/:id/applications', (req, res) => {
  try {
    const job_id = Number(req.params.id);
    const job = jobs.findById(job_id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const { applicant_name, applicant_email, resume_url, cover_letter } = req.body;
    if (!applicant_name) return res.status(400).json({ error: 'applicant_name is required' });
    if (!applicant_email) return res.status(400).json({ error: 'applicant_email is required' });

    const application = applications.create({
      job_id, applicant_name, applicant_email, resume_url, cover_letter,
    });
    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/jobs/:id/applications — list applications for a job
app.get('/api/jobs/:id/applications', (req, res) => {
  try {
    const job_id = Number(req.params.id);
    const job = jobs.findById(job_id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const rows = applications.findAll({ job_id });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Job Board API running on http://localhost:${PORT}`);
});

export default app;
