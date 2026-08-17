import { Search, Settings, Trophy } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { AgentDialog } from '../components/agent-dialog'
import { useAgentsQuery } from '../hooks/use-agents'
import { canManageAgents } from '../lib/permissions'

export function AgentsListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { user } = useAuth()
  const canManage = canManageAgents(user?.permissions)
  const { data, isLoading, isError } = useAgentsQuery({ search: search || undefined })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Agents</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/agents/rankings">
              <Trophy /> Rankings
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/agents/settings">
              <Settings /> Plans & territories
            </Link>
          </Button>
          {canManage && <AgentDialog />}
        </div>
      </div>

      <div className="relative w-72">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, code, employee #"
          className="pl-8"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent code</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Territory</TableHead>
              <TableHead>Commission plan</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">Loading agents…</TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-destructive">Failed to load agents.</TableCell>
              </TableRow>
            )}
            {data && data.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">No agents yet.</TableCell>
              </TableRow>
            )}
            {data?.results.map((agent) => (
              <TableRow key={agent.id} className="cursor-pointer" onClick={() => navigate(`/agents/${agent.id}`)}>
                <TableCell className="font-medium text-foreground">
                  <Link to={`/agents/${agent.id}`} className="hover:underline">
                    {agent.agent_code}
                  </Link>
                </TableCell>
                <TableCell>{agent.employee_name}</TableCell>
                <TableCell>{agent.territory_name ?? '—'}</TableCell>
                <TableCell>{agent.commission_plan_name ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={agent.is_active ? 'success' : 'secondary'}>
                    {agent.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
