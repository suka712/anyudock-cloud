import { verify } from 'hono/jwt'
import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { env } from '../utils/env.ts'

type Env = {
  Variables: {
    user: { sub: string; email: string }
  }
}

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const token = getCookie(c, 'session')

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const payload = await verify(token, env.JWT_SECRET, 'HS256')
    c.set('user', payload as { sub: string; email: string })
    await next()
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
})
