import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import * as schema from './schema'

export const DATA_DIR = process.env.DATA_DIR ?? join(process.cwd(), 'data')

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}

export const sqlite = new Database(join(DATA_DIR, 'excalihome.db'))
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema, casing: 'snake_case' })

export function runMigrations(): void {
  migrate(db, { migrationsFolder: join(__dirname, 'migrations') })
}
