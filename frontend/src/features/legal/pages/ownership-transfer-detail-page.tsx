import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { ActionPromptDialog } from '@/components/action-prompt-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { AddWitnessDialog } from '../components/add-witness-dialog'
import { TransferStatusBadge } from '../components/status-badges'
import {
  useApproveTransferMutation,
  useCompleteTransferMutation,
  useOwnershipTransferQuery,
  useRejectTransferMutation,
} from '../hooks/use-legal'
import { canApproveOwnershipTransfers, canManageWitnesses } from '../lib/permissions'

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString('en-GB') : '—'
}

export function OwnershipTransferDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canApprove = canApproveOwnershipTransfers(user?.permissions)
  const canAddWitness = canManageWitnesses(user?.permissions)
  const { data: transfer, isLoading, isError } = useOwnershipTransferQuery(id)
  const approve = useApproveTransferMutation(id ?? '')
  const reject = useRejectTransferMutation(id ?? '')
  const complete = useCompleteTransferMutation(id ?? '')

  if (isLoading) {
    return <p className="text-muted-foreground">Loading ownership transfer…</p>
  }

  if (isError || !transfer) {
    return <p className="text-destructive">Ownership transfer not found.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/legal')} aria-label="Back to legal">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{transfer.transfer_number}</h1>
            <p className="text-sm text-muted-foreground">
              Sale {transfer.sale_number} · Plot {transfer.plot_number} · {transfer.customer_name}
            </p>
          </div>
          <TransferStatusBadge status={transfer.status} />
        </div>
        {canApprove && (
          <div className="flex gap-2">
            {transfer.status === 'pending' && (
              <>
                <Button disabled={approve.isPending} onClick={() => approve.mutate()}>
                  Approve
                </Button>
                <ActionPromptDialog
                  trigger={<Button variant="destructive">Reject</Button>}
                  title="Reject ownership transfer"
                  label="Reason"
                  confirmLabel="Reject"
                  destructive
                  onConfirm={(value) => reject.mutateAsync(value)}
                />
              </>
            )}
            {transfer.status === 'approved' && (
              <Button disabled={complete.isPending} onClick={() => complete.mutate()}>
                Complete transfer
              </Button>
            )}
          </div>
        )}
      </div>

      {transfer.status === 'completed' && (
        <Card>
          <CardContent className="py-4 text-sm">
            This transfer was completed on {formatDateTime(transfer.completed_at)}. The plot has been marked{' '}
            <strong>Transferred</strong> and legal staff were notified.
          </CardContent>
        </Card>
      )}

      {transfer.status === 'rejected' && transfer.rejection_reason && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Rejection reason</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground">{transfer.rejection_reason}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Approval</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Requested by</p>
            <p className="font-medium text-foreground">{transfer.requested_by_name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Approved by</p>
            <p className="font-medium text-foreground">{transfer.approved_by_name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Approved at</p>
            <p className="font-medium text-foreground">{formatDateTime(transfer.approved_at)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Witnesses</CardTitle>
          {canAddWitness && id && (
            <AddWitnessDialog
              contentType="legal.ownershiptransfer"
              objectId={id}
              invalidateKey={['ownership-transfers', id]}
            />
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">SN</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>National ID</TableHead>
                <TableHead>Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfer.witnesses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No witnesses recorded yet.
                  </TableCell>
                </TableRow>
              )}
              {transfer.witnesses.map((witness, index) => (
                <TableRow key={witness.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium text-foreground">{witness.full_name}</TableCell>
                  <TableCell>{witness.national_id || '—'}</TableCell>
                  <TableCell>{witness.phone || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {transfer.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground">{transfer.notes}</CardContent>
        </Card>
      )}
    </div>
  )
}
