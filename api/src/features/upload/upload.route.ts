import { Hono } from "hono";
import { env } from "../../env.js";

export const uploadRouter = new Hono()

uploadRouter.post('/', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File

    const key = `${Date.now()}-${file.name}`
    const s3File = Bun.s3.file(key, {
      bucket: env.S3_BUCKET_NAME,
      endpoint: env.S3_ENDPOINT
    })

    await s3File.write(await file.arrayBuffer())

    return c.json({ url: s3File.presign() })
  } catch (e) {
    console.error('Upload error:', e)
    return c.json({ error: String(e)}, 500)
  }
})