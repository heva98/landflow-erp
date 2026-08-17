import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { formatTZS } from '@/lib/utils'

import { AddTierDialog } from '../components/add-tier-dialog'
import { CommissionPlanDialog } from '../components/commission-plan-dialog'
import { TerritoryDialog } from '../components/territory-dialog'
import { useCommissionPlansQuery, useTerritoriesQuery } from '../hooks/use-agents'
import { canManageCommissionPlans, canManageTerritories } from '../lib/permissions'
import { COMMISSION_PLAN_TYPE_LABELS } from '../types'

function CommissionPlansTab() {
  const { user } = useAuth()
  const canManage = canManageCommissionPlans(user?.permissions)
  const { data, isLoading } = useCommissionPlansQuery()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">{canManage && <CommissionPlanDialog />}</div>
      <div className="flex flex-col gap-3">
        {isLoading && <p className="text-center text-sm text-muted-foreground">Loading…</p>}
        {data && data.results.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">No commission plans yet.</p>
        )}
        {data?.results.map((plan) => (
          <div key={plan.id} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{plan.name}</p>
                <p className="text-sm text-muted-foreground">{COMMISSION_PLAN_TYPE_LABELS[plan.plan_type]}</p>
              </div>
              <div className="flex items-center gap-2">
                {plan.plan_type === 'percentage' && <Badge variant="info">{plan.rate_percent}%</Badge>}
                {plan.plan_type === 'flat' && <Badge variant="info">{formatTZS(plan.flat_amount ?? 0)}</Badge>}
                <Badge variant={plan.is_active ? 'success' : 'secondary'}>{plan.is_active ? 'Active' : 'Inactive'}</Badge>
              </div>
            </div>
            {plan.plan_type === 'tiered' && (
              <div className="mt-3 flex flex-col gap-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Min amount</TableHead>
                      <TableHead>Max amount</TableHead>
                      <TableHead>Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plan.tiers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">No tiers yet.</TableCell>
                      </TableRow>
                    )}
                    {plan.tiers.map((tier) => (
                      <TableRow key={tier.id}>
                        <TableCell>{formatTZS(tier.min_amount)}</TableCell>
                        <TableCell>{tier.max_amount ? formatTZS(tier.max_amount) : 'No limit'}</TableCell>
                        <TableCell>{tier.rate_percent}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {canManage && <AddTierDialog planId={plan.id} />}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function TerritoriesTab() {
  const { user } = useAuth()
  const canManage = canManageTerritories(user?.permissions)
  const { data, isLoading } = useTerritoriesQuery()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">{canManage && <TerritoryDialog />}</div>
      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Region</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">Loading…</TableCell>
              </TableRow>
            )}
            {data && data.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">No territories yet.</TableCell>
              </TableRow>
            )}
            {data?.results.map((territory) => (
              <TableRow key={territory.id}>
                <TableCell className="font-medium text-foreground">{territory.name}</TableCell>
                <TableCell>{territory.region || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export function CommissionSettingsPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/agents')} aria-label="Back to agents">
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">Plans & territories</h1>
      </div>

      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans">Commission plans</TabsTrigger>
          <TabsTrigger value="territories">Territories</TabsTrigger>
        </TabsList>
        <TabsContent value="plans">
          <CommissionPlansTab />
        </TabsContent>
        <TabsContent value="territories">
          <TerritoriesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
