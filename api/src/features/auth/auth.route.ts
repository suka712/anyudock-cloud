import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'
import { setCookie, getCookie, deleteCookie } from 'hono/cookie'
import { eq, and, gt } from 'drizzle-orm'
import { env } from '../../utils/env.ts'
import { db } from '../../db/index.ts'
import { users, otpCodes } from '../../db/schema.ts'
import { Resend } from 'resend'

const resend = new Resend(env.RESEND_API_KEY)

const OTP_EXPIRY_MINUTES = 10
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE,
  }
}

export const authRouter = new Hono()

authRouter.post('/send-otp', async (c) => {
  const { email } = await c.req.json<{ email: string }>()

  if (!email || !email.includes('@')) {
    return c.json({ error: 'Invalid email' }, 400)
  }

  const normalizedEmail = email.toLowerCase().trim()

  const existing = await db
    .select({ id: otpCodes.id })
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.email, normalizedEmail),
        eq(otpCodes.used, false),
        gt(otpCodes.expiresAt, new Date()),
      ),
    )
    .limit(1)

  if (existing.length > 0) {
    return c.json({ error: 'A code was already sent. Please wait for it to expire before requesting a new one.' }, 429)
  }

  const code = generateOtp()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

  await db.insert(otpCodes).values({
    email: normalizedEmail,
    code,
    expiresAt,
  })

  const { error: emailError } = await resend.emails.send({
    from: 'AnyuDock <noreply@anyudock.cloud>',
    to: normalizedEmail,
    subject: 'Your Sign in Code',
    html: `<p>Your verification code is: <strong>${code}</strong></p><p>This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>`,
  })

  if (emailError) {
    console.error('Failed to send email:', emailError)
    return c.json({ error: 'Failed to send code' }, 500)
  }

  console.log('Code sent')

  return c.json({ message: 'Code sent' })
})

authRouter.post('/verify-otp', async (c) => {
  const { email, code } = await c.req.json<{ email: string; code: string }>()

  if (!email || !code) {
    return c.json({ error: 'Email and code are required' }, 400)
  }

  const normalizedEmail = email.toLowerCase().trim()

  const [otp] = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.email, normalizedEmail),
        eq(otpCodes.code, code),
        eq(otpCodes.used, false),
        gt(otpCodes.expiresAt, new Date()),
      ),
    )
    .limit(1)

  if (!otp) {
    return c.json({ error: 'Invalid or expired code' }, 401)
  }

  // Mark OTP as used
  await db
    .update(otpCodes)
    .set({ used: true })
    .where(eq(otpCodes.id, otp.id))

  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1)

  if (!user) {
    [user] = await db
      .insert(users)
      .values({ email: normalizedEmail })
      .returning()
  }

  // Issue JWT
  const now = Math.floor(Date.now() / 1000)
  const token = await sign(
    {
      sub: user.id,
      email: user.email,
      iat: now,
      exp: now + SESSION_MAX_AGE,
    },
    env.JWT_SECRET,
    'HS256',
  )

  setCookie(c, 'session', token, cookieOptions())

  return c.json({ user: { id: user.id, email: user.email } })
})

authRouter.post('/signout', (c) => {
  deleteCookie(c, 'session', { path: '/' })
  return c.json({ message: 'Signed out' })
})

authRouter.get('/me', async (c) => {
  const token = getCookie(c, 'session')

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const payload = await verify(token, env.JWT_SECRET, 'HS256')
    return c.json({ user: { id: payload.sub, email: payload.email } })
  } catch {
    deleteCookie(c, 'session', { path: '/' })
    return c.json({ error: 'Invalid session' }, 401)
  }
})
