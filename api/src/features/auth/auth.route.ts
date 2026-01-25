import { Hono } from "hono";
import { env } from "../../env.js";

export const authRouter = new Hono()

authRouter.post('/login', async (c) => {
  const body = await c.req.json()

  const password = body.password
  const username = body.username

  if (password !== env.ADMIN_PASSWORD || username !== env.ADMIN_USERNAME) {
    c.json({ message: 'invalid username or password' })
  }

  return c.json({ message: 'logged in successfully' })
})