import { createRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { rootRoute } from './root'
import { authQueryOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import '../index.css'

const Index = () => {
  return (
    <>
      
    </>
  )
}

export const dashRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Index,
})
