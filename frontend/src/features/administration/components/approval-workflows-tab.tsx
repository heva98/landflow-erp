import { Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { formatTZS } from '@/lib/utils'

import { useApprovalWorkflowsQuery, useDeleteApprovalStepMutation } from '../hooks/use-administration'
import { canManageApprovalWorkflows } from '../lib/permissions'
import { WORKFLOW_TYPE_LABELS } from '../types'
import { AddApprovalStepDialog } from './add-approval-step-dialog'
import { ApprovalWorkflowDialog } from './approval-workflow-dialog'

export function ApprovalWorkflowsTab() {
  const { user } = useAuth()
  const canManage = canManageApprovalWorkflows(user?.permissions)
  const { data, isLoading } = useApprovalWorkflowsQuery()
  const deleteStep = useDeleteApprovalStepMutation()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">{canManage && <ApprovalWorkflowDialog />}</div>
      <div className="flex flex-col gap-3">
        {isLoading && <p className="text-center text-sm text-muted-foreground">Loading…</p>}
        {data && data.results.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">No approval workflows yet.</p>
        )}
        {data?.results.map((workflow) => (
          <div key={workflow.id} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{workflow.name}</p>
                <p className="text-sm text-muted-foreground">
                  {WORKFLOW_TYPE_LABELS[workflow.workflow_type]}
                  {workflow.min_amount && ` · Above ${formatTZS(workflow.min_amount)}`}
                </p>
                {workflow.description && <p className="mt-1 text-sm text-muted-foreground">{workflow.description}</p>}
              </div>
              <Badge variant={workflow.is_active ? 'success' : 'secondary'}>
                {workflow.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">SN</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Step</TableHead>
                    <TableHead>Approving role</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workflow.steps.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">No steps yet.</TableCell>
                    </TableRow>
                  )}
                  {workflow.steps.map((step, index) => (
                    <TableRow key={step.id}>
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell>{step.order}</TableCell>
                      <TableCell>{step.name || '—'}</TableCell>
                      <TableCell>{step.role_name}</TableCell>
                      <TableCell className="text-right">
                        {canManage && (
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Remove step"
                            disabled={deleteStep.isPending}
                            onClick={() => deleteStep.mutate(step.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {canManage && (
                <div>
                  <AddApprovalStepDialog workflowId={workflow.id} nextOrder={workflow.steps.length + 1} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
