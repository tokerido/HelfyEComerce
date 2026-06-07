import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { pool } from './connection';

async function waitForDb(retries = 10, delayMs = 2000): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.execute('SELECT 1');
      console.log('[migrate] Database is ready');
      return;
    } catch {
      console.log(`[migrate] Waiting for DB... attempt ${i + 1}/${retries}`);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw new Error(`Database not available after ${retries} retries`);
}

async function runMigrations(): Promise<void> {
  await waitForDb();

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      filename   VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const [rows] = await pool.execute<mysql.RowDataPacket[]>(
      'SELECT id FROM _migrations WHERE filename = ?',
      [file]
    );

    if (rows.length > 0) {
      console.log(`[migrate] Skipping ${file} (already applied)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    const statements = sql.split(';').map(s => s.trim()).filter(Boolean);

    for (const statement of statements) {
      await pool.execute(statement);
    }

    await pool.execute('INSERT INTO _migrations (filename) VALUES (?)', [file]);
    console.log(`[migrate] Applied ${file}`);
  }

  console.log('[migrate] All migrations complete');
  await pool.end();
}

runMigrations().catch(err => {
  console.error('[migrate] Fatal error:', err);
  process.exit(1);
});
