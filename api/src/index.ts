import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { env } from './env.js'
import { healthRouter } from './features/health/health.route.js'
import { authRouter } from './features/auth/auth.route.js'

const app = new Hono()

app.route('/health', healthRouter)
app.route('/auth', authRouter)

serve({
  fetch: app.fetch,
  port: env.PORT
}, (info) => {
  console.log(`Server is running on port ${info.port}`)
})
