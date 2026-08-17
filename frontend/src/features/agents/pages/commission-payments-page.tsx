import { isAxiosError } from 'axios'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { ActionPromptDialog } from '@/components/action-prompt-dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { formatTZS } from '@/lib/utils'

import { CommissionPaymentStatusBadge } from '../components/status-badges'
import {
  useApproveCommissionPaymentMutation,
  useCancelCommissionPaymentMutation,
  useCommissionPaymentsQuery,
  useMarkCommissionPaymentPaidMutation,
} from '../hooks/use-agents'
import { canApproveCommissionPayments } from '../lib/permissions'
import { COMMISSION_PAYMENT_STATUS_LABELS, COMMISSION_PAYMENT_STATUSES, type CommissionPaymentStatus } from '../types'

function extractError(error: unknown): string {
  if (isAxiosError(error) && error.response?.status === 403) {
    return "You don't have permission to do that."
  }
  return 'Something went wrong. Please try again.'
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-GB')
}

export function CommissionPaymentsPage() {
  const [status, setStatus] = useState<CommissionPaymentStatus | 'all'>('pending')
  const { user } = useAuth()
  const canApprove = canApproveCommissionPayments(user?.permissions)
  const { data, isLoading } = useCommissionPaymentsQuery({ status: status === 'all' ? undefined : status })
  const approve = useApproveCommissionPaymentMutation()
  const markPaid = useMarkCommissionPaymentPaidMutation()
  const cancel = useCancelCommissionPaymentMutation()
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Commission payments</h1>
        <Select value={status} onValueChange={(value) => setStatus(value as CommissionPaymentStatus | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {COMMISSION_PAYMENT_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {COMMISSION_PAYMENT_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Sale</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Calculated</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">Loading…</TableCell>
              </TableRow>
            )}
            {data && data.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">No commission payments found.</TableCell>
              </TableRow>
            )}
            {data?.results.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium text-foreground">{payment.agent_name}</TableCell>
                <TableCell>{payment.sale_number ?? '—'}</TableCell>
                <TableCell>{formatTZS(payment.amount)}</TableCell>
                <TableCell>
                  <CommissionPaymentStatusBadge status={payment.status} />
                </TableCell>
                <TableCell>{formatDateTime(payment.calculated_at)}</TableCell>
                <TableCell className="flex justify-end gap-2">
                  {canApprove && payment.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        disabled={approve.isPending}
                        onClick={async () => {
                          setError(null)
                          try {
                            await approve.mutateAsync(payment.id)
                          } catch (err) {
                            setError(extractError(err))
                          }
                        }}
                      >
                        {approve.isPending && <Loader2 className="animate-spin" />}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        disabled={cancel.isPending}
                        onClick={async () => {
                          setError(null)
                          try {
                            await cancel.mutateAsync(payment.id)
                          } catch (err) {
                            setError(extractError(err))
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {canApprove && payment.status === 'approved' && (
                    <ActionPromptDialog
                      trigger={<Button size="sm">Mark paid</Button>}
                      title="Mark commission paid"
                      label="Payment reference"
                      confirmLabel="Mark paid"
                      onConfirm={async (value) => {
                        try {
                          await markPaid.mutateAsync({ id: payment.id, payment_reference: value })
                        } catch (err) {
                          setError(extractError(err))
                        }
                      }}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
