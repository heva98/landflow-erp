import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { formatTZS } from '@/lib/utils'

import { InstallmentStatusBadge } from '../components/installment-status-badge'
import { PaymentPlanStatusBadge } from '../components/payment-plan-status-badge'
import { RecordPaymentDialog } from '../components/record-payment-dialog'
import { usePaymentPlanQuery } from '../hooks/use-installments'
import { canRecordPayments } from '../lib/permissions'
import { PAYMENT_METHOD_LABELS } from '../types'

export function PaymentPlanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canRecord = canRecordPayments(user?.permissions)
  const { data: plan, isLoading, isError } = usePaymentPlanQuery(id)

  if (isLoading) {
    return <p className="text-muted-foreground">Loading payment plan…</p>
  }

  if (isError || !plan) {
    return <p className="text-destructive">Payment plan not found.</p>
  }

  const ledger = plan.installments
    .flatMap((installment) => installment.payments.map((payment) => ({ ...payment, sequence: installment.sequence })))
    .sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime())

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/installments')} aria-label="Back to installments">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{plan.sale_number}</h1>
          <p className="text-sm text-muted-foreground">{plan.customer_name}</p>
        </div>
        <PaymentPlanStatusBadge status={plan.status} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Principal</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {formatTZS(plan.principal_amount)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total payable</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {formatTZS(plan.total_payable)}
            {Number(plan.interest_rate) > 0 && (
              <p className="mt-1 text-xs font-normal text-muted-foreground">{plan.interest_rate}% interest</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Amount paid</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {formatTZS(plan.amount_paid)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Outstanding balance</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {formatTZS(plan.outstanding_balance)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead>Amount due</TableHead>
                <TableHead>Penalty</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {plan.installments.map((installment) => (
                <TableRow key={installment.id}>
                  <TableCell className="font-medium text-foreground">{installment.sequence}</TableCell>
                  <TableCell>{new Date(installment.due_date).toLocaleDateString()}</TableCell>
                  <TableCell>{formatTZS(installment.amount_due)}</TableCell>
                  <TableCell>{Number(installment.penalty_amount) > 0 ? formatTZS(installment.penalty_amount) : '—'}</TableCell>
                  <TableCell>{formatTZS(installment.amount_paid)}</TableCell>
                  <TableCell>{formatTZS(installment.balance)}</TableCell>
                  <TableCell>
                    <InstallmentStatusBadge status={installment.status} />
                  </TableCell>
                  <TableCell>
                    {canRecord && installment.status !== 'paid' && (
                      <RecordPaymentDialog paymentPlanId={plan.id} installment={installment} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer ledger</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt #</TableHead>
                <TableHead>Installment</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Paid at</TableHead>
                <TableHead>Recorded by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledger.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No payments recorded yet.
                  </TableCell>
                </TableRow>
              )}
              {ledger.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium text-foreground">{payment.receipt_number}</TableCell>
                  <TableCell>#{payment.sequence}</TableCell>
                  <TableCell>{formatTZS(payment.amount)}</TableCell>
                  <TableCell>{PAYMENT_METHOD_LABELS[payment.method]}</TableCell>
                  <TableCell>{new Date(payment.paid_at).toLocaleString()}</TableCell>
                  <TableCell>{payment.recorded_by_name ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {plan.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground">{plan.notes}</CardContent>
        </Card>
      )}
    </div>
  )
}
