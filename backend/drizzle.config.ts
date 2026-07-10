import { join } from 'path'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  casing: 'snake_case',
  dbCredentials: {
    url: join(process.env.DATA_DIR ?? './data', 'excalihome.db'),
  },
})
