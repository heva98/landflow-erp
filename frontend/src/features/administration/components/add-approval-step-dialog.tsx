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
import { RoleSelect } from '@/features/accounts/components/role-select'

import { useCreateApprovalStepMutation } from '../hooks/use-administration'

const stepSchema = z.object({
  order: z.number().int().positive('Must be 1 or more'),
  role: z.string().min(1, 'Select a role'),
  name: z.string().max(150).optional(),
})
type StepValues = z.infer<typeof stepSchema>

export function AddApprovalStepDialog({ workflowId, nextOrder }: { workflowId: string; nextOrder: number }) {
  const [open, setOpen] = useState(false)
  const createStep = useCreateApprovalStepMutation()

  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<StepValues>({
    resolver: zodResolver(stepSchema),
    defaultValues: { order: nextOrder, role: '', name: '' },
  })

  async function submit(values: StepValues) {
    await createStep.mutateAsync({ workflow: workflowId, order: values.order, role: values.role, name: values.name ?? '' })
    setOpen(false)
    reset({ order: nextOrder + 1, role: '', name: '' })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus /> Add step
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add approval step</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
              type="number"
              min="1"
              aria-invalid={Boolean(errors.order)}
              {...register('order', { valueAsNumber: true })}
            />
            {errors.order && <p className="text-sm text-destructive">{errors.order.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Approving role</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => <RoleSelect value={field.value} onChange={field.onChange} placeholder="Select a role" />}
            />
            {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Step name (optional)</Label>
            <Input id="name" placeholder="e.g. Finance review" {...register('name')} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Add step
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
