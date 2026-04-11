import { Outlet, createRootRoute } from '@tanstack/react-router'
import '../index.css'

export const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
    </div>
  ),
})
