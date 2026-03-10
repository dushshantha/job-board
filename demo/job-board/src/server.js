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

// GET /api/jobs/tags — list unique tags with counts (must be before /api/jobs/:id)
// Query params: status (default: open)
app.get('/api/jobs/tags', (req, res) => {
  try {
    const { status = 'open' } = req.query;
    const tags = jobs.allTags({ status: status || undefined });
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/jobs — list jobs with optional filtering and sorting
// Query params: search, location, remote (true/false), status, company_id, sort, tag, type
app.get('/api/jobs', (req, res) => {
  try {
    const { search, location, remote, status, company_id, sort, tag, type } = req.query;

    const rows = jobs.findAll({
      search: search || undefined,
      location: location || undefined,
      remote: remote !== undefined ? remote : undefined,
      status: status || undefined,
      company_id: company_id ? Number(company_id) : undefined,
      sort: sort || 'newest',
      tag: tag || undefined,
    });

    // Client-requested type filter (not in DB query to keep it simple)
    const filtered = type ? rows.filter(j => j.type === type) : rows;
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/jobs/:id — get a single job with company details
app.get('/api/jobs/:id', (req, res) => {
  try {
    const job = jobs.findById(Number(req.params.id));
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
      type, salary_min, salary_max, remote, status, tags,
    } = req.body;

    if (!company_id) return res.status(400).json({ error: 'company_id is required' });
    if (!title) return res.status(400).json({ error: 'title is required' });

    const job = jobs.create({
      company_id, title, description, location,
      type, salary_min, salary_max, remote, status,
      tags: Array.isArray(tags) ? tags : [],
    });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/jobs/:id — update a job (including tags)
app.patch('/api/jobs/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const job = jobs.findById(id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const updated = jobs.update(id, req.body);
    res.json(updated);
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
