import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { env } from './env.js'
import { healthRouter } from './features/health/health.route.js'

const app = new Hono()

app.get('/')

app.get('/', (c) => {
  return c.text('Hello from Hono!')
})

app.route('/health', healthRouter)

serve({
  fetch: app.fetch,
  port: env.PORT
}, (info) => {
  console.log(`Server is running on port ${info.port}`)
})
