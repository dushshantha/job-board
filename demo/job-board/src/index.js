import { initDb } from './db/db.js';

// Initialize the database on startup
const db = initDb();
console.log('Database initialized successfully.');

export { db };
