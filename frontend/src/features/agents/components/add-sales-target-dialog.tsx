import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
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

import { useCreateSalesTargetMutation } from '../hooks/use-agents'

const targetSchema = z.object({
  period_start: z.string().min(1, 'Required'),
  period_end: z.string().min(1, 'Required'),
  target_amount: z.number().nonnegative('Must be zero or more'),
  target_plot_count: z.number().nonnegative('Must be zero or more'),
})
type TargetValues = z.infer<typeof targetSchema>

export function AddSalesTargetDialog({ agentId }: { agentId: string }) {
  const [open, setOpen] = useState(false)
  const createTarget = useCreateSalesTargetMutation()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TargetValues>({
    resolver: zodResolver(targetSchema),
    defaultValues: { target_amount: 0, target_plot_count: 0 },
  })

  async function submit(values: TargetValues) {
    await createTarget.mutateAsync({ agent: agentId, ...values })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus /> New target
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New sales target</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="period_start">Period start</Label>
              <Input
                id="period_start"
                type="date"
                aria-invalid={Boolean(errors.period_start)}
                {...register('period_start')}
              />
              {errors.period_start && <p className="text-sm text-destructive">{errors.period_start.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="period_end">Period end</Label>
              <Input
                id="period_end"
                type="date"
                aria-invalid={Boolean(errors.period_end)}
                {...register('period_end')}
              />
              {errors.period_end && <p className="text-sm text-destructive">{errors.period_end.message}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="target_amount">Target amount (TZS)</Label>
            <Input
              id="target_amount"
              type="number"
              step="0.01"
              min="0"
              {...register('target_amount', { valueAsNumber: true })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="target_plot_count">Target plot count</Label>
            <Input id="target_plot_count" type="number" min="0" {...register('target_plot_count', { valueAsNumber: true })} />
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
