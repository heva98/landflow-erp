import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { useApproveSubdivisionMutation, useRejectSubdivisionMutation, useSubmitSubdivisionMutation } from '../hooks/use-surveys'
import { canApproveSurveys, canManageSurveys } from '../lib/permissions'
import type { Subdivision } from '../types'

export function SubdivisionWorkflowActions({ subdivision }: { subdivision: Subdivision }) {
  const { user } = useAuth()
  const canManage = canManageSurveys(user?.permissions)
  const canApprove = canApproveSurveys(user?.permissions)
  const submit = useSubmitSubdivisionMutation(subdivision.id)
  const approve = useApproveSubdivisionMutation(subdivision.id)
  const reject = useRejectSubdivisionMutation(subdivision.id)

  if (!canManage && !canApprove) return null

  return (
    <div className="flex gap-2">
      {canManage && subdivision.status === 'draft' && (
        <Button disabled={submit.isPending} onClick={() => submit.mutate()}>
          Submit for approval
        </Button>
      )}
      {canApprove && subdivision.status === 'submitted' && (
        <>
          <Button disabled={approve.isPending} onClick={() => approve.mutate()}>
            Approve
          </Button>
          <Button variant="destructive" disabled={reject.isPending} onClick={() => reject.mutate()}>
            Reject
          </Button>
        </>
      )}
    </div>
  )
}
