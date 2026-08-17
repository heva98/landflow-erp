import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatTZS } from '@/lib/utils'

import { useAgentRankingsQuery } from '../hooks/use-agents'

export function RankingsPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const { data, isLoading } = useAgentRankingsQuery({
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  })

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-foreground">Agent rankings</h1>

      <div className="flex items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="start_date">From</Label>
          <Input id="start_date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="end_date">To</Label>
          <Input id="end_date" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        </div>
      </div>

      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Territory</TableHead>
              <TableHead>Sales</TableHead>
              <TableHead>Total commission</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">Loading…</TableCell>
              </TableRow>
            )}
            {data && data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">No active agents with commission yet.</TableCell>
              </TableRow>
            )}
            {data?.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-semibold text-foreground">#{row.rank}</TableCell>
                <TableCell>{row.employee_name} <span className="text-muted-foreground">({row.agent_code})</span></TableCell>
                <TableCell>{row.territory_name ?? '—'}</TableCell>
                <TableCell>{row.sale_count}</TableCell>
                <TableCell className="font-medium text-foreground">{formatTZS(row.total_commission)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
