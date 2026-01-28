import { Hono } from "hono";
import { env } from "../../env.ts";
import { S3Client } from "bun";
import { authMiddleware } from "../../middlewares/auth.middleware.ts";
import { json } from "stream/consumers";

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

    const key = `${crypto.randomUUID()}-${file.name}`
    await S3Client.write(key, await file.arrayBuffer(), {
      ...credentials,
      type: file.type
    })

    const url = S3Client.presign(key, credentials)
    console.log('User uploaded a file:', key)

    return c.json({ url })
  } catch (e) {
    console.error('Upload error:', e)
    return c.json({ error: String(e) }, 500)
  }
})

fileRouter.get('/', authMiddleware, async (c) => {
  const result = await S3Client.list(null, credentials)
  return c.json(result.contents)
})

fileRouter.get('/:key', authMiddleware, (c) => {
  const key = c.req.param('key')
  const url = S3Client.presign(key, credentials)
  console.log('User requested a file:', key)

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