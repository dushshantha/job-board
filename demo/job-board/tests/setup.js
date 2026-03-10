/**
 * Test database setup helpers.
 *
 * Environment variables are set in the npm test script so they are available
 * before any module is loaded (including server.js which calls initDb()).
 * This file provides per-suite helpers for cleaning up between test runs.
 */

import { existsSync, unlinkSync } from 'fs';
import { resolve } from 'path';

/**
 * Delete the test database file so each test run starts fresh.
 * Only applicable when DB_PATH points to a file (not :memory:).
 */
export function cleanTestDb() {
  const dbPath = process.env.DB_PATH;
  if (dbPath && dbPath !== ':memory:' && existsSync(resolve(dbPath))) {
    unlinkSync(resolve(dbPath));
  }
}
