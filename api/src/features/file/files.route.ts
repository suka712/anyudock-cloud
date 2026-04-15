import { Hono } from "hono";
import { env } from "../../utils/env.ts";
import { S3Client } from "bun";
import { authMiddleware } from "../../middlewares/auth.middleware.ts";
import { db } from "../../db/index.ts";
import { files } from "../../db/schema.ts";
import { eq } from "drizzle-orm";

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

    return c.json({ url, id })
  } catch (e) {
    console.error('Upload error:', e)
    return c.json({ error: String(e) }, 500)
  }
})

fileRouter.get('/', authMiddleware, async (c) => {
  try {
    const userId = c.get('user').sub
    const result = await db.select()
      .from(files)
      .where(eq(files.userId, userId))
      .orderBy(files.createdAt)

    return c.json(result)
  } catch (e) {
    console.error('List error:', e)
    return c.json({ error: 'Failed to list files' }, 500)
  }
})

fileRouter.get('/:key/view', async (c) => {
  const key = c.req.param('key')
  try {
    const [file] = await db.select()
      .from(files)
      .where(eq(files.id, key))

    if (!file || file.isPrivate) {
      return c.json({ error: 'File not found or private' }, 404)
    }

    const url = S3Client.presign(key, credentials)
    return c.redirect(url)
  } catch (e) {
    return c.json({ error: 'Failed to access file' }, 500)
  }
})

fileRouter.patch('/:key/privacy', authMiddleware, async (c) => {
  const key = c.req.param('key')
  const userId = c.get('user').sub
  const { isPrivate } = await c.req.json<{ isPrivate: boolean }>()

  try {
    const [file] = await db.select()
      .from(files)
      .where(eq(files.id, key))

    if (!file) {
      return c.json({ error: 'File not found' }, 404)
    }
    if (file.userId !== userId) {
      return c.json({ error: 'User not authorized' }, 403)
    }

    await db.update(files)
      .set({ isPrivate })
      .where(eq(files.id, key))

    return c.json({ message: `Privacy updated for ${key}`, isPrivate })
  } catch (e) {
    return c.json({ error: 'Failed to update privacy' }, 500)
  }
})

fileRouter.get('/:key', authMiddleware, async (c) => {
  const key = c.req.param('key')
  const userId = c.get('user').sub;

  try {
    const [file] = await db.select().from(files).where(eq(files.id, key))

    if (!file) {
      return c.json({ error: 'File not found' }, 404)
    }
    if (file.userId !== userId) {
      return c.json({ error: 'User not authorized' }, 403)
    }

    const url = S3Client.presign(key, credentials)
    return c.json({ url })
  } catch (e) {
    console.error('Error retrieving file:', e)
    return c.json({ error: 'Failed to retrieve file' }, 500)
  }
})

fileRouter.delete('/:key', authMiddleware, async (c) => {
  const key = c.req.param('key')
  const userId = c.get('user').sub

  try {
    const [file] = await db.select()
      .from(files)
      .where(eq(files.id, key))

    if (!file) {
      return c.json({ error: 'File not found' }, 404)
    }

    if (file.userId !== userId) {
      return c.json({ error: 'User not authorized' }, 403)
    }

    await S3Client.delete(key, credentials)
    await db.delete(files).where(eq(files.id, key))

    return c.json({ message: `File deleted: ${key}` })
  } catch (e) {
    console.error('Error deleting file:', e)
    return c.json({ error: 'Failed to delete file' }, 500)
  }
})