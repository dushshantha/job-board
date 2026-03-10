/**
 * Integration tests for Job Board API
 *
 * Uses Jest + Supertest against an in-memory SQLite database.
 * Run with: npm test
 */

import request from 'supertest';
import app from '../src/server.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Shared state populated during beforeAll. */
let company;
let job;
let application;

// ---------------------------------------------------------------------------
// Companies
// ---------------------------------------------------------------------------

describe('Companies', () => {
  describe('POST /api/companies', () => {
    it('creates a company with all fields', async () => {
      const res = await request(app)
        .post('/api/companies')
        .send({
          name: 'Acme Corp',
          website: 'https://acme.example',
          location: 'San Francisco, CA',
          description: 'A test company',
          logo_url: 'https://acme.example/logo.png',
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        name: 'Acme Corp',
        website: 'https://acme.example',
        location: 'San Francisco, CA',
      });
      expect(res.body.id).toBeDefined();
      company = res.body;
    });

    it('creates a company with only the required name field', async () => {
      const res = await request(app)
        .post('/api/companies')
        .send({ name: 'Minimal Inc' });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Minimal Inc');
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/companies')
        .send({ website: 'https://no-name.example' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/name/i);
    });
  });

  describe('GET /api/companies', () => {
    it('returns an array of companies', async () => {
      const res = await request(app).get('/api/companies');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('includes the company we created', async () => {
      const res = await request(app).get('/api/companies');
      const found = res.body.find((c) => c.id === company.id);
      expect(found).toBeDefined();
      expect(found.name).toBe('Acme Corp');
    });
  });

  describe('GET /api/companies/:id', () => {
    it('returns the company with a jobs array', async () => {
      const res = await request(app).get(`/api/companies/${company.id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(company.id);
      expect(Array.isArray(res.body.jobs)).toBe(true);
    });

    it('returns 404 for a non-existent company', async () => {
      const res = await request(app).get('/api/companies/999999');
      expect(res.status).toBe(404);
    });
  });
});

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

describe('Jobs', () => {
  describe('POST /api/jobs', () => {
    it('creates a job with all fields', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .send({
          company_id: company.id,
          title: 'Senior Engineer',
          description: 'Build cool things',
          location: 'Remote',
          type: 'full-time',
          salary_min: 120000,
          salary_max: 180000,
          remote: true,
          status: 'open',
          tags: ['react', 'node', 'typescript'],
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        title: 'Senior Engineer',
        company_id: company.id,
        remote: 1,
        status: 'open',
      });
      expect(Array.isArray(res.body.tags)).toBe(true);
      expect(res.body.tags).toContain('react');
      expect(res.body.id).toBeDefined();
      job = res.body;
    });

    it('creates a closed job', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .send({
          company_id: company.id,
          title: 'Old Role',
          status: 'closed',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('closed');
    });

    it('returns 400 when company_id is missing', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .send({ title: 'No Company' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/company_id/i);
    });

    it('returns 400 when title is missing', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .send({ company_id: company.id });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/title/i);
    });
  });

  describe('GET /api/jobs', () => {
    it('returns an array of jobs', async () => {
      const res = await request(app).get('/api/jobs');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('filters by status=open', async () => {
      const res = await request(app).get('/api/jobs?status=open');

      expect(res.status).toBe(200);
      expect(res.body.every((j) => j.status === 'open')).toBe(true);
    });

    it('filters by status=closed', async () => {
      const res = await request(app).get('/api/jobs?status=closed');

      expect(res.status).toBe(200);
      expect(res.body.every((j) => j.status === 'closed')).toBe(true);
    });

    it('filters by remote=true', async () => {
      const res = await request(app).get('/api/jobs?remote=true');

      expect(res.status).toBe(200);
      // All returned jobs should be remote (remote === 1)
      expect(res.body.every((j) => j.remote === 1)).toBe(true);
    });

    it('filters by company_id', async () => {
      const res = await request(app).get(`/api/jobs?company_id=${company.id}`);

      expect(res.status).toBe(200);
      expect(res.body.every((j) => j.company_id === company.id)).toBe(true);
    });

    it('filters by tag', async () => {
      const res = await request(app).get('/api/jobs?tag=react');

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body.every((j) => j.tags.includes('react'))).toBe(true);
    });

    it('filters by type', async () => {
      const res = await request(app).get('/api/jobs?type=full-time');

      expect(res.status).toBe(200);
      expect(res.body.every((j) => j.type === 'full-time')).toBe(true);
    });

    it('searches by text (full-text search)', async () => {
      const res = await request(app).get('/api/jobs?search=Senior');

      expect(res.status).toBe(200);
      const titles = res.body.map((j) => j.title);
      expect(titles.some((t) => t.includes('Senior'))).toBe(true);
    });

    it('sorts by newest (default)', async () => {
      const res = await request(app).get('/api/jobs?sort=newest');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('sorts by salary_desc', async () => {
      const res = await request(app).get('/api/jobs?sort=salary_desc');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('sorts by company_asc', async () => {
      const res = await request(app).get('/api/jobs?sort=company_asc');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('returns empty array for search with no matches', async () => {
      const res = await request(app).get(
        '/api/jobs?search=xyzzy_no_match_ever_12345'
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('includes company_name in each job', async () => {
      const res = await request(app).get('/api/jobs');

      expect(res.status).toBe(200);
      expect(res.body.every((j) => typeof j.company_name === 'string')).toBe(true);
    });
  });

  describe('GET /api/jobs/tags', () => {
    it('returns an array of tag objects with count', async () => {
      const res = await request(app).get('/api/jobs/tags');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('tag');
        expect(res.body[0]).toHaveProperty('count');
      }
    });

    it('defaults to open jobs', async () => {
      const res = await request(app).get('/api/jobs/tags');
      expect(res.status).toBe(200);
    });

    it('filters by status query param', async () => {
      const res = await request(app).get('/api/jobs/tags?status=open');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/jobs/:id', () => {
    it('returns a job with company details', async () => {
      const res = await request(app).get(`/api/jobs/${job.id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(job.id);
      expect(res.body.title).toBe('Senior Engineer');
      expect(res.body.company_name).toBe('Acme Corp');
      expect(typeof res.body.company_website).toBeDefined();
    });

    it('returns 404 for a non-existent job', async () => {
      const res = await request(app).get('/api/jobs/999999');
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/jobs/:id', () => {
    it('updates job fields', async () => {
      const res = await request(app)
        .patch(`/api/jobs/${job.id}`)
        .send({ title: 'Staff Engineer', salary_max: 200000 });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Staff Engineer');
      expect(res.body.salary_max).toBe(200000);
      // Restore for later tests
      await request(app)
        .patch(`/api/jobs/${job.id}`)
        .send({ title: 'Senior Engineer' });
    });

    it('updates tags array', async () => {
      const res = await request(app)
        .patch(`/api/jobs/${job.id}`)
        .send({ tags: ['react', 'graphql', 'postgres'] });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.tags)).toBe(true);
      expect(res.body.tags).toContain('graphql');
    });

    it('closes a job', async () => {
      const res = await request(app)
        .patch(`/api/jobs/${job.id}`)
        .send({ status: 'closed' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('closed');

      // Reopen for later tests
      await request(app)
        .patch(`/api/jobs/${job.id}`)
        .send({ status: 'open' });
    });

    it('returns 404 for a non-existent job', async () => {
      const res = await request(app)
        .patch('/api/jobs/999999')
        .send({ title: 'Ghost' });

      expect(res.status).toBe(404);
    });
  });
});

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------

describe('Applications', () => {
  describe('POST /api/jobs/:id/applications', () => {
    it('submits an application with all fields', async () => {
      const res = await request(app)
        .post(`/api/jobs/${job.id}/applications`)
        .send({
          applicant_name: 'Jane Doe',
          applicant_email: 'jane@example.com',
          resume_url: 'https://example.com/resume.pdf',
          cover_letter: 'I am very interested in this position.',
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        applicant_name: 'Jane Doe',
        applicant_email: 'jane@example.com',
        status: 'pending',
      });
      expect(res.body.id).toBeDefined();
      application = res.body;
    });

    it('submits an application with only required fields', async () => {
      const res = await request(app)
        .post(`/api/jobs/${job.id}/applications`)
        .send({
          applicant_name: 'John Smith',
          applicant_email: 'john@example.com',
        });

      expect(res.status).toBe(201);
      expect(res.body.applicant_name).toBe('John Smith');
    });

    it('returns 400 when applicant_name is missing', async () => {
      const res = await request(app)
        .post(`/api/jobs/${job.id}/applications`)
        .send({ applicant_email: 'noname@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/applicant_name/i);
    });

    it('returns 400 when applicant_email is missing', async () => {
      const res = await request(app)
        .post(`/api/jobs/${job.id}/applications`)
        .send({ applicant_name: 'No Email' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/applicant_email/i);
    });

    it('returns 404 when job does not exist', async () => {
      const res = await request(app)
        .post('/api/jobs/999999/applications')
        .send({
          applicant_name: 'Ghost',
          applicant_email: 'ghost@example.com',
        });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/jobs/:id/applications', () => {
    it('returns applications for a job', async () => {
      const res = await request(app).get(
        `/api/jobs/${job.id}/applications`
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('includes job_title and company_name on each application', async () => {
      const res = await request(app).get(
        `/api/jobs/${job.id}/applications`
      );

      expect(res.status).toBe(200);
      const app0 = res.body[0];
      expect(typeof app0.job_title).toBe('string');
      expect(typeof app0.company_name).toBe('string');
    });

    it('returns 404 when job does not exist', async () => {
      const res = await request(app).get(
        '/api/jobs/999999/applications'
      );

      expect(res.status).toBe(404);
    });

    it('returns empty array when job has no applications', async () => {
      // Create a brand-new job with no applications
      const newJob = await request(app)
        .post('/api/jobs')
        .send({ company_id: company.id, title: 'Lonely Job' });

      const res = await request(app).get(
        `/api/jobs/${newJob.body.id}/applications`
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });
});
