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

import { useCreateAttendanceMutation } from '../hooks/use-hr'
import { ATTENDANCE_STATUS_LABELS, ATTENDANCE_STATUSES } from '../types'

const attendanceSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  status: z.enum(ATTENDANCE_STATUSES),
  check_in: z.string().optional(),
  check_out: z.string().optional(),
})
type AttendanceValues = z.infer<typeof attendanceSchema>

export function LogAttendanceDialog({ employeeId }: { employeeId: string }) {
  const [open, setOpen] = useState(false)
  const createAttendance = useCreateAttendanceMutation()

  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AttendanceValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: { date: new Date().toISOString().slice(0, 10), status: 'present' },
  })

  async function submit(values: AttendanceValues) {
    await createAttendance.mutateAsync({
      employee: employeeId,
      date: values.date,
      status: values.status,
      check_in: values.check_in || undefined,
      check_out: values.check_out || undefined,
    })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus /> Log attendance
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log attendance</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" aria-invalid={Boolean(errors.date)} {...register('date')} />
            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ATTENDANCE_STATUSES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {ATTENDANCE_STATUS_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="check_in">Check in</Label>
              <Input id="check_in" type="time" {...register('check_in')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="check_out">Check out</Label>
              <Input id="check_out" type="time" {...register('check_out')} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Log
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
