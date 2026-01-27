import { Hono } from "hono";
import { env } from "../../env.js";
import { S3Client } from "bun";

const credentials = {
  accessKeyId: env.S3_ACCESS_KEY_ID,
  secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  bucket: env.S3_BUCKET_NAME,
  endpoint: env.S3_ENDPOINT
}

export const fileRouter = new Hono()

fileRouter.post('/', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File

    const key = `${Date.now()}-${file.name}`
    await S3Client.write(key, await file.arrayBuffer(), {
      ...credentials,
      type: file.type
    })

    const url = S3Client.presign(key, credentials)
    return c.json({ url })
  } catch (e) {
    console.error('Upload error:', e)
    return c.json({ error: String(e) }, 500)
  }
})

fileRouter.get('/', async (c) => {
  const result = await S3Client.list(null, credentials)
  return c.json(result.contents)
})

fileRouter.get('/:key', (c) => {
  const key = c.req.param('key')
  const url = S3Client.presign(key, credentials)
  return c.json({ url })
})