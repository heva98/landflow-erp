import { isAxiosError } from 'axios'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { formatTZS } from '@/lib/utils'

import { CreatePayrollRecordDialog } from '../components/create-payroll-record-dialog'
import { PayrollStatusBadge } from '../components/status-badges'
import { useMarkPayrollRecordPaidMutation, usePayrollRecordsQuery, useProcessPayrollRecordMutation } from '../hooks/use-hr'
import { canManagePayroll } from '../lib/permissions'
import { PAYROLL_STATUS_LABELS, PAYROLL_STATUSES, type PayrollStatus } from '../types'

function extractError(error: unknown): string {
  if (isAxiosError(error) && error.response?.status === 403) {
    return "You don't have permission to do that."
  }
  return 'Something went wrong. Please try again.'
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB')
}

export function PayrollPage() {
  const [status, setStatus] = useState<PayrollStatus | 'all'>('all')
  const { user } = useAuth()
  const canManage = canManagePayroll(user?.permissions)
  const { data, isLoading } = usePayrollRecordsQuery({ status: status === 'all' ? undefined : status })
  const process = useProcessPayrollRecordMutation()
  const markPaid = useMarkPayrollRecordPaidMutation()
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Payroll</h1>
        <div className="flex items-center gap-3">
          <Select value={status} onValueChange={(value) => setStatus(value as PayrollStatus | 'all')}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {PAYROLL_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {PAYROLL_STATUS_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canManage && <CreatePayrollRecordDialog />}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">SN</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Net pay</TableHead>
              <TableHead>Status</TableHead>
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
                <TableCell colSpan={6} className="text-center text-muted-foreground">No payroll records found.</TableCell>
              </TableRow>
            )}
            {data?.results.map((record, index) => (
              <TableRow key={record.id}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-medium text-foreground">{record.employee_name}</TableCell>
                <TableCell>{formatDate(record.pay_period_start)} – {formatDate(record.pay_period_end)}</TableCell>
                <TableCell>{formatTZS(record.net_pay)}</TableCell>
                <TableCell>
                  <PayrollStatusBadge status={record.status} />
                </TableCell>
                <TableCell className="text-right">
                  {canManage && record.status === 'draft' && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={process.isPending}
                      onClick={async () => {
                        setError(null)
                        try {
                          await process.mutateAsync(record.id)
                        } catch (err) {
                          setError(extractError(err))
                        }
                      }}
                    >
                      {process.isPending && <Loader2 className="animate-spin" />}
                      Process
                    </Button>
                  )}
                  {canManage && record.status === 'processed' && (
                    <Button
                      size="sm"
                      disabled={markPaid.isPending}
                      onClick={async () => {
                        setError(null)
                        try {
                          await markPaid.mutateAsync(record.id)
                        } catch (err) {
                          setError(extractError(err))
                        }
                      }}
                    >
                      {markPaid.isPending && <Loader2 className="animate-spin" />}
                      Mark paid
                    </Button>
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
