const API_URL = process.env.BUN_PUBLIC_API_URL ?? 'http://localhost:8080'

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const data = await res.json()

  if (!res.ok) {
    throw new ApiError(res.status, (data as { error?: string }).error ?? 'Request failed')
  }

  return data as T
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}
