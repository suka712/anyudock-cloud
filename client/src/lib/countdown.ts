import { useState, useEffect } from 'react'

function formatCountdown(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now()

  if (diff <= 0) return 'EXPIRED'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}D ${hours % 24}H`
  }

  if (hours > 0) return `${hours}H ${minutes}M`
  return `${minutes}M`
}

export function useCountdown(expiresAt: string | null): string | null {
  const [display, setDisplay] = useState<string | null>(() =>
    expiresAt ? formatCountdown(expiresAt) : null,
  )

  useEffect(() => {
    if (!expiresAt) {
      setDisplay(null)
      return
    }

    setDisplay(formatCountdown(expiresAt))

    const interval = setInterval(() => {
      setDisplay(formatCountdown(expiresAt))
    }, 60_000)

    return () => clearInterval(interval)
  }, [expiresAt])

  return display
}
