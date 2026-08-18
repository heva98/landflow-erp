import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { useActivityLogsQuery } from '../hooks/use-administration'
import { ACTIVITY_ACTION_LABELS, ACTIVITY_ACTIONS, type ActivityAction } from '../types'

const ACTION_BADGE: Record<ActivityAction, 'success' | 'destructive' | 'secondary'> = {
  login: 'success',
  login_failed: 'destructive',
  logout: 'secondary',
}

export function ActivityLogTab() {
  const [action, setAction] = useState<ActivityAction | 'all'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data, isLoading } = useActivityLogsQuery({
    action: action === 'all' ? undefined : action,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={action} onValueChange={(value) => setAction(value as typeof action)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All activity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All activity</SelectItem>
            {ACTIVITY_ACTIONS.map((value) => (
              <SelectItem key={value} value={value}>{ACTIVITY_ACTION_LABELS[value]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" className="w-40" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
        <span className="text-sm text-muted-foreground">to</span>
        <Input type="date" className="w-40" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
      </div>

      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>IP address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">Loading…</TableCell>
              </TableRow>
            )}
            {data && data.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">No activity recorded yet.</TableCell>
              </TableRow>
            )}
            {data?.results.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {new Date(entry.created_at).toLocaleString()}
                </TableCell>
                <TableCell>{entry.actor_email ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={ACTION_BADGE[entry.action]}>{ACTIVITY_ACTION_LABELS[entry.action]}</Badge>
                  {entry.description && <span className="ml-2 text-sm text-muted-foreground">{entry.description}</span>}
                </TableCell>
                <TableCell>{entry.ip_address ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
