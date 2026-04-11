import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'

const elem = document.getElementById('root')!
const app = (
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)

if (import.meta.hot) {
  const root = (import.meta.hot.data.root ??= createRoot(elem))
  root.render(app)
} else {
  createRoot(elem).render(app)
}
