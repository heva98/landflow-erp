import { LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/use-auth'

export function Topbar() {
  const { user, logout } = useAuth()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div className="text-sm font-medium text-muted-foreground">
        {user?.role?.name ?? '—'}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-foreground">{user?.email}</span>
        <Button variant="ghost" size="icon" onClick={logout} aria-label="Sign out">
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  )
}
