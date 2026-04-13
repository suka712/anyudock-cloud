import { drizzle } from 'drizzle-orm/bun-sql'
import { env } from '../utils/env.ts'
import * as schema from './schema.ts'
import { migrate } from 'drizzle-orm/bun-sql/migrator'

export const db = drizzle({
  connection: env.DATABASE_URL,
  schema,
})

await migrate(db, { migrationsFolder: './src/db/drizzle' }).then(() => console.log('Migrations ran successfully'))