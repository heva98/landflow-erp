import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { useCancelSiteVisitMutation, useCompleteSiteVisitMutation, useStartSiteVisitMutation } from '../hooks/use-site-visits'
import { canManageSiteVisits } from '../lib/permissions'
import type { SiteVisit } from '../types'

export function SiteVisitWorkflowActions({ siteVisit }: { siteVisit: SiteVisit }) {
  const { user } = useAuth()
  const canManage = canManageSiteVisits(user?.permissions)
  const start = useStartSiteVisitMutation(siteVisit.id)
  const complete = useCompleteSiteVisitMutation(siteVisit.id)
  const cancel = useCancelSiteVisitMutation(siteVisit.id)

  if (!canManage) return null

  return (
    <div className="flex gap-2">
      {siteVisit.status === 'scheduled' && (
        <>
          <Button disabled={start.isPending} onClick={() => start.mutate()}>
            Start visit
          </Button>
          <Button variant="destructive" disabled={cancel.isPending} onClick={() => cancel.mutate()}>
            Cancel
          </Button>
        </>
      )}
      {siteVisit.status === 'in_progress' && (
        <Button disabled={complete.isPending} onClick={() => complete.mutate()}>
          Mark completed
        </Button>
      )}
    </div>
  )
}
