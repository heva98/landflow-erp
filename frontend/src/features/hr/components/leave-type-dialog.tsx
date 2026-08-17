import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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

import { useCreateLeaveTypeMutation } from '../hooks/use-hr'

const leaveTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  default_days_per_year: z.number().nonnegative('Must be zero or more'),
  is_paid: z.boolean(),
})
type LeaveTypeValues = z.infer<typeof leaveTypeSchema>

export function LeaveTypeDialog() {
  const [open, setOpen] = useState(false)
  const createLeaveType = useCreateLeaveTypeMutation()

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<LeaveTypeValues>({
      resolver: zodResolver(leaveTypeSchema),
      defaultValues: { name: '', default_days_per_year: 0, is_paid: true },
    })

  async function submit(values: LeaveTypeValues) {
    await createLeaveType.mutateAsync(values)
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New leave type
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New leave type</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" aria-invalid={Boolean(errors.name)} {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="default_days_per_year">Default days per year</Label>
            <Input
              id="default_days_per_year"
              type="number"
              min="0"
              {...register('default_days_per_year', { valueAsNumber: true })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="is_paid"
              checked={watch('is_paid')}
              onCheckedChange={(checked) => setValue('is_paid', checked === true)}
            />
            <Label htmlFor="is_paid">Paid leave</Label>
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
