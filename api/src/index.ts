import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { env } from './utils/env.ts'
import { healthRouter } from './features/health/health.route.ts'
import { authRouter } from './features/auth/auth.route.ts'
import { cors } from 'hono/cors'
import { fileRouter } from './features/file/files.route.ts'
import { getCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'
import { startCleanupInterval } from './utils/cleanup.ts'

const app = new Hono()

app.use(
  '*',
  cors({
    origin: env.ALLOWED_ORIGINS.split(','),
    credentials: true,
  }),
)

app.get('/', async (c) => {
  const token = getCookie(c, 'session')
  if (token) {
    try {
      const payload = await verify(token, env.JWT_SECRET, 'HS256')
      return c.json({
        message: 'Welcome to AnyuDock API',
        user: { id: payload.sub, email: payload.email },
        dashboard: `${env.ALLOWED_ORIGINS.split(',')[0]}/dashboard`,
      })
    } catch {
      // Invalid token, fall through
    }
  }
  return c.json({
    message: 'AnyuDock API',
    login: `${env.ALLOWED_ORIGINS.split(',')[0]}/`,
  })
})

app.route('/health', healthRouter)
app.route('/auth', authRouter)
app.route('/file', fileRouter)

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`🍊 Server is running on port ${info.port}`)
    startCleanupInterval()
  },
)
