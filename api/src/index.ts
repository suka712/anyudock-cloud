import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { env } from './utils/env.ts'
import { healthRouter } from './features/health/health.route.ts'
import { authRouter } from './features/auth/auth.route.ts'
import { cors } from 'hono/cors'
import { fileRouter } from './features/file/files.route.ts'

const app = new Hono()

app.use('*', cors({
  origin: env.ALLOWED_ORIGINS.split(','),
  credentials: true,
}))

app.route('/health', healthRouter)
app.route('/auth', authRouter)
app.route('/file', fileRouter)
// hello
serve({
  fetch: app.fetch,
  port: env.PORT
}, (info) => {
  console.log(`Server is running on port ${info.port}`)
})
