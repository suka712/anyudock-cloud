import { createRouter } from '@tanstack/react-router'
import { rootRoute } from './routes/root'
import { indexRoute } from './routes/index'
import { signinRoute } from './routes/signin'
import { verifyRoute } from './routes/verify'

const routeTree = rootRoute.addChildren([
  indexRoute,
  signinRoute,
  verifyRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
