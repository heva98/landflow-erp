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
import { Textarea } from '@/components/ui/textarea'

import { useCreateLeaveRequestMutation } from '../hooks/use-hr'
import { LeaveTypeSelect } from './selects'

const leaveRequestSchema = z.object({
  leave_type: z.string().min(1, 'Select a leave type'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  reason: z.string().max(2000).optional(),
})
type LeaveRequestValues = z.infer<typeof leaveRequestSchema>

export function RequestLeaveDialog({ employeeId }: { employeeId: string }) {
  const [open, setOpen] = useState(false)
  const createLeaveRequest = useCreateLeaveRequestMutation()

  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<LeaveRequestValues>({ resolver: zodResolver(leaveRequestSchema) })

  async function submit(values: LeaveRequestValues) {
    await createLeaveRequest.mutateAsync({ employee: employeeId, ...values })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus /> Request leave
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request leave</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label>Leave type</Label>
            <Controller
              control={control}
              name="leave_type"
              render={({ field }) => <LeaveTypeSelect value={field.value ?? ''} onChange={field.onChange} />}
            />
            {errors.leave_type && <p className="text-sm text-destructive">{errors.leave_type.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="start_date">Start date</Label>
              <Input id="start_date" type="date" aria-invalid={Boolean(errors.start_date)} {...register('start_date')} />
              {errors.start_date && <p className="text-sm text-destructive">{errors.start_date.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="end_date">End date</Label>
              <Input id="end_date" type="date" aria-invalid={Boolean(errors.end_date)} {...register('end_date')} />
              {errors.end_date && <p className="text-sm text-destructive">{errors.end_date.message}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" rows={3} {...register('reason')} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Submit request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
