import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import './index.css'

export function App() {
  const navigate = useNavigate()

  async function handleSignOut() {
    await api('/auth/signout', { method: 'POST' })
    navigate({ to: '/signin' })
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

export default App
