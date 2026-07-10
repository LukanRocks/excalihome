import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const boards = sqliteTable('boards', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  boardData: text({ mode: 'json' }).notNull(),
  createdAt: integer({ mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
})

export type Board = typeof boards.$inferSelect
export type NewBoard = typeof boards.$inferInsert
