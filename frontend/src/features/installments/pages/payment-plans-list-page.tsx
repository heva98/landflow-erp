import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useCustomersQuery } from '@/features/crm/hooks/use-customers'
import { formatTZS } from '@/lib/utils'

import { PaymentPlanStatusBadge } from '../components/payment-plan-status-badge'
import { usePaymentPlansQuery } from '../hooks/use-installments'
import { canCreatePaymentPlans } from '../lib/permissions'
import { PAYMENT_PLAN_STATUS_LABELS, PAYMENT_PLAN_STATUSES, type PaymentPlanStatus } from '../types'

export function PaymentPlansListPage() {
  const [status, setStatus] = useState<PaymentPlanStatus | 'all'>('all')
  const [customer, setCustomer] = useState<string>('all')
  const { user } = useAuth()
  const canCreate = canCreatePaymentPlans(user?.permissions)
  const { data: customers } = useCustomersQuery()

  const { data, isLoading, isError } = usePaymentPlansQuery({
    status: status === 'all' ? undefined : status,
    customer: customer === 'all' ? undefined : customer,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Installments</h1>
        {canCreate && (
          <Button asChild>
            <Link to="/installments/new">
              <Plus /> New payment plan
            </Link>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Select value={status} onValueChange={(value) => setStatus(value as PaymentPlanStatus | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {PAYMENT_PLAN_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {PAYMENT_PLAN_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={customer} onValueChange={setCustomer}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All customers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All customers</SelectItem>
            {customers?.results.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sale #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Installments paid</TableHead>
              <TableHead>Outstanding balance</TableHead>
              <TableHead>Start date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Loading payment plans…
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-destructive">
                  Failed to load payment plans.
                </TableCell>
              </TableRow>
            )}
            {data && data.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No payment plans yet.
                </TableCell>
              </TableRow>
            )}
            {data?.results.map((plan) => {
              const paidCount = plan.installments.filter((installment) => installment.status === 'paid').length
              return (
                <TableRow key={plan.id} className="cursor-pointer">
                  <TableCell className="font-medium text-foreground">
                    <Link to={`/installments/${plan.id}`}>{plan.sale_number}</Link>
                  </TableCell>
                  <TableCell>{plan.customer_name}</TableCell>
                  <TableCell>
                    <PaymentPlanStatusBadge status={plan.status} />
                  </TableCell>
                  <TableCell>
                    {paidCount} / {plan.number_of_installments}
                  </TableCell>
                  <TableCell>{formatTZS(plan.outstanding_balance)}</TableCell>
                  <TableCell>{new Date(plan.start_date).toLocaleDateString()}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
