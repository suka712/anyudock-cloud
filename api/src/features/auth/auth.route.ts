import { Hono } from "hono";
import { env } from "../../env.js";
import { sign } from "hono/jwt";

export const authRouter = new Hono()

authRouter.post('/login', async (c) => {
  const {username, password} = await c.req.json()

  if (password !== env.ADMIN_PASSWORD || username !== env.ADMIN_USERNAME) {
    return c.json({ message: 'invalid username or password' }, 401)
  }

  const token = await sign({ user: username }, env.JWT_SECRET)
  return c.json({ token })
})