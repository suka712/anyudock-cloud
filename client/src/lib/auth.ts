import { queryOptions } from '@tanstack/react-query'
import { api } from './api'

type User = { id: string; email: string }

export const authQueryOptions = queryOptions({
  queryKey: ['auth'],
  queryFn: () => api<{ user: User }>('/auth/me').then((r) => r.user),
  staleTime: 5 * 60 * 1000,
  retry: false,
})
