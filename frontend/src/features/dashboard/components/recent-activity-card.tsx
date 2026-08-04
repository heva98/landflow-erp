import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { RecentActivityEntry } from '../types'

const ACTION_VARIANT: Record<string, 'success' | 'info' | 'destructive' | 'secondary'> = {
  Create: 'success',
  Update: 'info',
  Delete: 'destructive',
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatRelativeTime(isoDate: string) {
  const diffMinutes = Math.round((Date.now() - new Date(isoDate).getTime()) / 60_000)
  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d ago`
  return new Date(isoDate).toLocaleDateString()
}

export function RecentActivityCard({ entries }: { entries: RecentActivityEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <Badge variant={ACTION_VARIANT[entry.action] ?? 'secondary'}>{entry.action}</Badge>
                  <span className="truncate text-foreground">
                    {titleCase(entry.model)} <span className="text-muted-foreground">{entry.object_repr}</span>
                  </span>
                </div>
                <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
                  {entry.actor} · {formatRelativeTime(entry.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
