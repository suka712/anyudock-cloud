import { verify } from "hono/jwt";
import { createMiddleware } from "hono/factory";
import { env } from "../env.ts";

export const authMiddleware = createMiddleware(async (c, next) => {
  const header = c.req.header('Authorization')

  if (!header?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = header.slice(7)

  try {
    const payload = await verify(token, env.JWT_SECRET, { alg: 'HS256' })
    await next()
  } catch (e) {
    return c.json({ error: 'Invalid token' }, 401)
  }
})