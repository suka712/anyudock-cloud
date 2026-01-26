import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { env } from './env.js'
import { healthRouter } from './features/health/health.route.js'
import { authRouter } from './features/auth/auth.route.js'
import { cors } from 'hono/cors'
import { fileRouter } from './features/file/files.route.js'

const app = new Hono()

app.use('*', cors({
  origin: ['http://localhost:3000', 'https://anyudock.cloud']
}))

app.route('/health', healthRouter)
app.route('/auth', authRouter)
app.route('/file', fileRouter)

serve({
  fetch: app.fetch,
  port: env.PORT
}, (info) => {
  console.log(`Server is running on port ${info.port}`)
})
