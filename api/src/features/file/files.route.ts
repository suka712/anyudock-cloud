import { Hono } from "hono";
import { env } from "../../utils/env.ts";
import { S3Client } from "bun";
import { authMiddleware } from "../../middlewares/auth.middleware.ts";
import { db } from "../../db/index.ts";
import { files } from "../../db/schema.ts";
import {eq} from 'drizzle-orm'

const credentials = {
  accessKeyId: env.S3_ACCESS_KEY_ID,
  secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  bucket: env.S3_BUCKET_NAME,
  endpoint: env.S3_ENDPOINT
}

export const fileRouter = new Hono()

fileRouter.post('/', authMiddleware, async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    const fileName = formData.get('fileName') as string;

    const [{ id }] = await db.insert(files).values({
      userId: c.get('user').sub,
      name: fileName,
      size: file.size,
      mimeType: file.type,
    }).returning()

    await S3Client.write(id, await file.arrayBuffer(), {
      ...credentials,
      type: file.type
    })

    const url = S3Client.presign(id, credentials)

    return c.json({ url })
  } catch (e) {
    console.error('Upload error:', e)
    return c.json({ error: String(e) }, 500)
  }
})

fileRouter.get('/', authMiddleware, async (c) => {
  const userId = c.get('user').sub;
  const selectedFiles = await db.select().from(files).where(eq(files.userId, userId))


  return c.json(selectedFiles)
})

fileRouter.get('/:key', authMiddleware, async (c) => {
  const key = c.req.param('key')
  const [ownerId] = await db.select({ name: files.userId }).from(files).where(eq(files.id, key))
  const userId = c.get('user').sub;

  if (ownerId.name !== userId) {
    return c.json({ error: 'User not authorized' }, 403)
  }

  const url = S3Client.presign(key, credentials)

  return c.json({ url })
})

fileRouter.delete('/:key', authMiddleware, async (c) => {
  const key = c.req.param('key')
  try {
    await S3Client.delete(key, credentials)
    return c.json({ message: `File deleted: ${key}` })
  } catch (e) {
    console.log('Error deleting file:', e)
    return c.json({ error: 'Failed to delete file' }, 500)
  }
})