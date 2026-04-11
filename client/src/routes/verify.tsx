import { createRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, type FormEvent } from 'react'
import { rootRoute } from './root'
import { api, ApiError } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

type VerifySearch = { email: string }

function Verify() {
  const { email } = verifyRoute.useSearch()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (!email) {
      navigate({ to: '/signin' })
    }
  }, [email, navigate])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const code = (formData.get('code') as string).trim()

    try {
      await api('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      })
      navigate({ to: '/' })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setError('')
    try {
      await api('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setResendCooldown(60)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We sent a 6-digit code to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="code">Verification code</Label>
              <Input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
                required
                autoFocus
                autoComplete="one-time-code"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {resendCooldown > 0 ? (
              <span>Resend code in {resendCooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="underline underline-offset-4 hover:text-foreground"
              >
                Resend code
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const verifyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verify',
  component: Verify,
  validateSearch: (search: Record<string, unknown>): VerifySearch => ({
    email: (search.email as string) ?? '',
  }),
})
