import { db } from '../db/index.ts'
import { files } from '../db/schema.ts'
import { eq, and, lte, isNotNull } from 'drizzle-orm'
import { S3Client } from 'bun'
import { env } from './env.ts'

const credentials = {
  accessKeyId: env.S3_ACCESS_KEY_ID,
  secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  bucket: env.S3_BUCKET_NAME,
  endpoint: env.S3_ENDPOINT,
}

export async function cleanupExpiredFiles() {
  const expired = await db
    .select()
    .from(files)
    .where(and(isNotNull(files.expiresAt), lte(files.expiresAt, new Date())))

  for (const file of expired) {
    try {
      await S3Client.delete(file.id, credentials)
      await db.delete(files).where(eq(files.id, file.id))
      console.log(`Cleaned up expired file: ${file.name} (${file.id})`)
    } catch (e) {
      console.error(`Failed to cleanup file ${file.id}:`, e)
    }
  }

  if (expired.length > 0) {
    console.log(`Cleanup complete: removed ${expired.length} expired file(s)`)
  }

  return expired.length
}
