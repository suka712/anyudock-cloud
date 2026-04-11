import { createRoute, redirect } from '@tanstack/react-router'
import { rootRoute } from './root'
import { api } from '@/lib/api'
import { App } from '../App'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
  beforeLoad: async () => {
    try {
      await api('/auth/me')
    } catch {
      throw redirect({ to: '/signin' })
    }
  },
})
