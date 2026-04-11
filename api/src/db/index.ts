import { drizzle } from 'drizzle-orm/bun-sql'
import { env } from '../env.ts'
import * as schema from './schema.ts'

export const db = drizzle({
  connection: env.DATABASE_URL,
  schema,
})
