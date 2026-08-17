import { ActionPromptDialog } from '@/components/action-prompt-dialog'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/use-auth'

import {
  useApproveSurveyMutation,
  useCompleteSurveyMutation,
  useRejectSurveyMutation,
  useStartSurveyMutation,
} from '../hooks/use-surveys'
import { canApproveSurveys, canManageSurveys } from '../lib/permissions'
import type { Survey } from '../types'

export function SurveyWorkflowActions({ survey }: { survey: Survey }) {
  const { user } = useAuth()
  const canManage = canManageSurveys(user?.permissions)
  const canApprove = canApproveSurveys(user?.permissions)
  const start = useStartSurveyMutation(survey.id)
  const complete = useCompleteSurveyMutation(survey.id)
  const approve = useApproveSurveyMutation(survey.id)
  const reject = useRejectSurveyMutation(survey.id)

  if (!canManage && !canApprove) return null

  return (
    <div className="flex gap-2">
      {canManage && survey.status === 'scheduled' && (
        <Button disabled={start.isPending} onClick={() => start.mutate()}>
          Start survey
        </Button>
      )}
      {canManage && survey.status === 'in_progress' && (
        <ActionPromptDialog
          trigger={<Button>Mark completed</Button>}
          title="Complete survey"
          label="Area surveyed (sqm)"
          placeholder="Leave blank to keep the current estimate"
          onConfirm={(value) => complete.mutateAsync(value || undefined)}
        />
      )}
      {canApprove && survey.status === 'completed' && (
        <>
          <Button disabled={approve.isPending} onClick={() => approve.mutate()}>
            Approve
          </Button>
          <ActionPromptDialog
            trigger={<Button variant="destructive">Reject</Button>}
            title="Reject survey"
            label="Reason"
            confirmLabel="Reject"
            destructive
            onConfirm={(value) => reject.mutateAsync(value)}
          />
        </>
      )}
    </div>
  )
}
