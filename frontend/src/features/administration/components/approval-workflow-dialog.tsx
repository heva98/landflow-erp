import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { useCreateApprovalWorkflowMutation } from '../hooks/use-administration'
import { WORKFLOW_TYPE_LABELS, WORKFLOW_TYPES } from '../types'

const workflowSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150),
  workflow_type: z.enum(WORKFLOW_TYPES),
  description: z.string().max(2000).optional(),
  min_amount: z.number().nonnegative().optional(),
})
type WorkflowValues = z.infer<typeof workflowSchema>

export function ApprovalWorkflowDialog() {
  const [open, setOpen] = useState(false)
  const createWorkflow = useCreateApprovalWorkflowMutation()

  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<WorkflowValues>({
    resolver: zodResolver(workflowSchema),
    defaultValues: { workflow_type: 'other' },
  })

  async function submit(values: WorkflowValues) {
    await createWorkflow.mutateAsync({ ...values, min_amount: values.min_amount ?? null })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New workflow
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New approval workflow</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" aria-invalid={Boolean(errors.name)} {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Applies to</Label>
            <Controller
              control={control}
              name="workflow_type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKFLOW_TYPES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {WORKFLOW_TYPE_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="min_amount">Applies above amount (TZS, optional)</Label>
            <Input id="min_amount" type="number" step="0.01" min="0" {...register('min_amount', { valueAsNumber: true })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register('description')} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
