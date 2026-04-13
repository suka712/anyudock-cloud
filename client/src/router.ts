import { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { rootRoute } from './routes/root'
import { indexRoute } from './routes/index'
import { dashboardRoute } from './routes/dashboard'

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
])

export const queryClient = new QueryClient()

export const router = createRouter({
  routeTree,
  context: { queryClient },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
