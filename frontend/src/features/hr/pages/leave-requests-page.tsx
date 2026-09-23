import { isAxiosError } from 'axios'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { ActionPromptDialog } from '@/components/action-prompt-dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { LeaveRequestStatusBadge } from '../components/status-badges'
import {
  useApproveLeaveRequestMutation,
  useCancelLeaveRequestMutation,
  useLeaveRequestsQuery,
  useRejectLeaveRequestMutation,
} from '../hooks/use-hr'
import { canApproveLeaveRequests } from '../lib/permissions'
import { LEAVE_REQUEST_STATUS_LABELS, LEAVE_REQUEST_STATUSES, type LeaveRequestStatus } from '../types'

function extractError(error: unknown): string {
  if (isAxiosError(error) && error.response?.status === 403) {
    return "You don't have permission to do that."
  }
  return 'Something went wrong. Please try again.'
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB')
}

export function LeaveRequestsPage() {
  const [status, setStatus] = useState<LeaveRequestStatus | 'all'>('pending')
  const { user } = useAuth()
  const canApprove = canApproveLeaveRequests(user?.permissions)
  const { data, isLoading } = useLeaveRequestsQuery({ status: status === 'all' ? undefined : status })
  const approve = useApproveLeaveRequestMutation()
  const reject = useRejectLeaveRequestMutation()
  const cancel = useCancelLeaveRequestMutation()
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Leave requests</h1>
        <Select value={status} onValueChange={(value) => setStatus(value as LeaveRequestStatus | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {LEAVE_REQUEST_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {LEAVE_REQUEST_STATUS_LABELS[value]}
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
              <TableHead className="w-12">SN</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">Loading…</TableCell>
              </TableRow>
            )}
            {data && data.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">No leave requests found.</TableCell>
              </TableRow>
            )}
            {data?.results.map((request, index) => (
              <TableRow key={request.id}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-medium text-foreground">{request.employee_name}</TableCell>
                <TableCell>{request.leave_type_name}</TableCell>
                <TableCell>{formatDate(request.start_date)} – {formatDate(request.end_date)}</TableCell>
                <TableCell>{request.requested_days}</TableCell>
                <TableCell>
                  <LeaveRequestStatusBadge status={request.status} />
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  {request.status === 'pending' && canApprove && (
                    <>
                      <Button
                        size="sm"
                        disabled={approve.isPending}
                        onClick={async () => {
                          setError(null)
                          try {
                            await approve.mutateAsync(request.id)
                          } catch (err) {
                            setError(extractError(err))
                          }
                        }}
                      >
                        {approve.isPending && <Loader2 className="animate-spin" />}
                        Approve
                      </Button>
                      <ActionPromptDialog
                        trigger={<Button size="sm" variant="destructive">Reject</Button>}
                        title="Reject leave request"
                        label="Reason"
                        confirmLabel="Reject"
                        destructive
                        onConfirm={async (value) => {
                          try {
                            await reject.mutateAsync({ id: request.id, rejection_reason: value })
                          } catch (err) {
                            setError(extractError(err))
                          }
                        }}
                      />
                    </>
                  )}
                  {request.status === 'pending' && !canApprove && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={cancel.isPending}
                      onClick={async () => {
                        setError(null)
                        try {
                          await cancel.mutateAsync(request.id)
                        } catch (err) {
                          setError(extractError(err))
                        }
                      }}
                    >
                      Cancel
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
