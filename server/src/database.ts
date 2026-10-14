import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const databasePath = process.env.MOMENTUM_DB_PATH
  ? resolve(process.env.MOMENTUM_DB_PATH)
  : resolve(dirname(fileURLToPath(import.meta.url)), '../data/momentum.sqlite')

mkdirSync(dirname(databasePath), { recursive: true })

export const database = new Database(databasePath)

database.pragma('journal_mode = WAL')
database.pragma('foreign_keys = ON')
database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    token_hash TEXT NOT NULL UNIQUE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    is_guest INTEGER NOT NULL CHECK (is_guest IN (0, 1)),
    created_at INTEGER NOT NULL,
    expires_at INTEGER,
    CHECK ((is_guest = 1 AND user_id IS NULL) OR (is_guest = 0 AND user_id IS NOT NULL))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    favourite INTEGER NOT NULL DEFAULT 0 CHECK (favourite IN (0, 1)),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    scheduled_date TEXT,
    start_time TEXT,
    end_time TEXT,
    is_completed INTEGER NOT NULL DEFAULT 0 CHECK (is_completed IN (0, 1)),
    created_at INTEGER NOT NULL,
    completed_at INTEGER,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE
  );
`)

const taskColumns = database.pragma('table_info(tasks)') as { name: string }[]
if (!taskColumns.some((column) => column.name === 'user_id')) {
  database.exec('ALTER TABLE tasks ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE')
}

database.exec(`
  CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
`)
