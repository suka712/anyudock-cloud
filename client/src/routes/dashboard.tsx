import { createRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { rootRoute } from './root'
import { authQueryOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import '../index.css'

const Dashboard = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  async function handleSignOut() {
    await api('/auth/signout', { method: 'POST' })
    queryClient.removeQueries({ queryKey: ['auth'] })
    navigate({ to: '/' })
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Anyu Dock</h1>
        <Button variant="outline" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">File management goes here.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(authQueryOptions)
    } catch {
      throw redirect({ to: '/' })
    }
  },
})
