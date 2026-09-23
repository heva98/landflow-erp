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
import { Textarea } from '@/components/ui/textarea'

import { useCreateFollowUpMutation } from '../hooks/use-site-visits'

const addFollowUpSchema = z.object({
  due_date: z.string().min(1, 'Required'),
  notes: z.string().optional(),
})
type AddFollowUpValues = z.infer<typeof addFollowUpSchema>

export function AddFollowUpDialog({ bookingId }: { bookingId: string }) {
  const [open, setOpen] = useState(false)
  const createFollowUp = useCreateFollowUpMutation(bookingId)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddFollowUpValues>({
    resolver: zodResolver(addFollowUpSchema),
  })

  async function submit(values: AddFollowUpValues) {
    await createFollowUp.mutateAsync({ booking: bookingId, ...values })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus /> Add follow-up
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add follow-up</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="due_date">Due date</Label>
            <Input id="due_date" type="date" aria-invalid={Boolean(errors.due_date)} {...register('due_date')} />
            {errors.due_date && <p className="text-sm text-destructive">{errors.due_date.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...register('notes')} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
