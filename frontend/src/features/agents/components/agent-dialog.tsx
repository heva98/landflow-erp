import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { Loader2, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

import { useCreateAgentMutation, useUpdateAgentMutation } from '../hooks/use-agents'
import type { Agent } from '../types'
import { AvailableEmployeeSelect, CommissionPlanSelect, TerritorySelect } from './selects'

const agentSchema = z.object({
  employee: z.string().min(1, 'Select an employee'),
  territory: z.string().optional(),
  commission_plan: z.string().optional(),
  notes: z.string().max(2000).optional(),
})
type AgentValues = z.infer<typeof agentSchema>

export function AgentDialog({ agent }: { agent?: Agent }) {
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const createAgent = useCreateAgentMutation()
  const updateAgent = useUpdateAgentMutation(agent?.id ?? '')

  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AgentValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      employee: agent?.employee ?? '',
      territory: agent?.territory ?? '',
      commission_plan: agent?.commission_plan ?? '',
      notes: agent?.notes ?? '',
    },
  })

  async function submit(values: AgentValues) {
    setFormError(null)
    const input = {
      employee: values.employee,
      territory: values.territory || null,
      commission_plan: values.commission_plan || null,
      notes: values.notes ?? '',
    }
    try {
      if (agent) {
        await updateAgent.mutateAsync(input)
      } else {
        await createAgent.mutateAsync(input)
      }
      setOpen(false)
      reset()
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 403) {
        setFormError("You don't have permission to do that.")
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {agent ? (
          <Button size="icon" variant="ghost" aria-label="Edit agent">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button size="sm">
            <Plus /> New agent
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{agent ? 'Edit agent' : 'New agent'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label>Employee</Label>
            <Controller
              control={control}
              name="employee"
              render={({ field }) => <AvailableEmployeeSelect value={field.value} onChange={field.onChange} />}
            />
            {errors.employee && <p className="text-sm text-destructive">{errors.employee.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Territory</Label>
            <Controller
              control={control}
              name="territory"
              render={({ field }) => <TerritorySelect value={field.value ?? ''} onChange={field.onChange} />}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Commission plan</Label>
            <Controller
              control={control}
              name="commission_plan"
              render={({ field }) => <CommissionPlanSelect value={field.value ?? ''} onChange={field.onChange} />}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...register('notes')} />
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {agent ? 'Save changes' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
