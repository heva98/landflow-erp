import { isAxiosError } from 'axios'
import { ArrowLeft, Loader2, Power } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { formatTZS } from '@/lib/utils'

import { AddSalesTargetDialog } from '../components/add-sales-target-dialog'
import { AgentDialog } from '../components/agent-dialog'
import { CommissionPaymentStatusBadge } from '../components/status-badges'
import { useAgentQuery, useCommissionPaymentsQuery, useSalesTargetsQuery, useUpdateAgentMutation } from '../hooks/use-agents'
import { canManageAgents } from '../lib/permissions'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB')
}

function extractError(error: unknown): string {
  if (isAxiosError(error) && error.response?.status === 403) {
    return "You don't have permission to do that."
  }
  return 'Something went wrong. Please try again.'
}

export function AgentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canManage = canManageAgents(user?.permissions)
  const { data: agent, isLoading, isError } = useAgentQuery(id)
  const { data: targets } = useSalesTargetsQuery({ agent: id })
  const { data: payments } = useCommissionPaymentsQuery({ agent: id })
  const updateAgent = useUpdateAgentMutation(id ?? '')
  const [error, setError] = useState<string | null>(null)

  if (isLoading) {
    return <p className="text-muted-foreground">Loading agent…</p>
  }

  if (isError || !agent) {
    return <p className="text-destructive">Agent not found.</p>
  }

  async function toggleActive() {
    if (!agent) return
    setError(null)
    try {
      await updateAgent.mutateAsync({
        employee: agent.employee,
        territory: agent.territory,
        commission_plan: agent.commission_plan,
        is_active: !agent.is_active,
        notes: agent.notes,
      })
    } catch (err) {
      setError(extractError(err))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/agents')} aria-label="Back to agents">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{agent.employee_name}</h1>
            <p className="text-sm text-muted-foreground">
              {agent.agent_code} ·{' '}
              <Link to={`/hr/employees/${agent.employee}`} className="hover:underline">
                {agent.employee_number}
              </Link>
            </p>
          </div>
          <Badge variant={agent.is_active ? 'success' : 'secondary'}>{agent.is_active ? 'Active' : 'Inactive'}</Badge>
        </div>
        {canManage && (
          <div className="flex flex-col items-end gap-1">
            <div className="flex gap-2">
              <AgentDialog agent={agent} />
              <Button variant="outline" disabled={updateAgent.isPending} onClick={toggleActive}>
                {updateAgent.isPending ? <Loader2 className="animate-spin" /> : <Power />}
                {agent.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Territory</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-semibold text-foreground">{agent.territory_name ?? '—'}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Commission plan</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-semibold text-foreground">{agent.commission_plan_name ?? '—'}</CardContent>
        </Card>
      </div>

      <Tabs defaultValue="targets">
        <TabsList>
          <TabsTrigger value="targets">Sales targets</TabsTrigger>
          <TabsTrigger value="commissions">Commission payments</TabsTrigger>
        </TabsList>

        <TabsContent value="targets">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Sales targets</CardTitle>
              {canManage && <AddSalesTargetDialog agentId={agent.id} />}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Achieved</TableHead>
                    <TableHead>Target plots</TableHead>
                    <TableHead>Achieved plots</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {targets && targets.results.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">No sales targets yet.</TableCell>
                    </TableRow>
                  )}
                  {targets?.results.map((target) => (
                    <TableRow key={target.id}>
                      <TableCell>{formatDate(target.period_start)} – {formatDate(target.period_end)}</TableCell>
                      <TableCell>{formatTZS(target.target_amount)}</TableCell>
                      <TableCell>{formatTZS(target.achieved_amount)}</TableCell>
                      <TableCell>{target.target_plot_count}</TableCell>
                      <TableCell>{target.achieved_plot_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle>Commission payments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sale</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Calculated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments && payments.results.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">No commission payments yet.</TableCell>
                    </TableRow>
                  )}
                  {payments?.results.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.sale_number ?? '—'}</TableCell>
                      <TableCell>{formatTZS(payment.amount)}</TableCell>
                      <TableCell>
                        <CommissionPaymentStatusBadge status={payment.status} />
                      </TableCell>
                      <TableCell>{formatDate(payment.calculated_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {agent.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground">{agent.notes}</CardContent>
        </Card>
      )}
    </div>
  )
}
