import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
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
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { useCreateFeedbackMutation } from '../hooks/use-site-visits'

const addFeedbackSchema = z.object({
  rating: z.enum(['1', '2', '3', '4', '5']),
  comments: z.string().optional(),
  interested_in_purchasing: z.boolean(),
})
type AddFeedbackValues = z.infer<typeof addFeedbackSchema>

export function AddFeedbackDialog({ bookingId }: { bookingId: string }) {
  const [open, setOpen] = useState(false)
  const createFeedback = useCreateFeedbackMutation(bookingId)
  const { control, register, handleSubmit, reset, formState: { isSubmitting } } = useForm<AddFeedbackValues>({
    resolver: zodResolver(addFeedbackSchema),
    defaultValues: { rating: '5', interested_in_purchasing: false },
  })

  async function submit(values: AddFeedbackValues) {
    await createFeedback.mutateAsync({
      booking: bookingId,
      rating: Number(values.rating),
      comments: values.comments ?? '',
      interested_in_purchasing: values.interested_in_purchasing,
    })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus /> Add feedback
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record visit feedback</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rating">Rating</Label>
            <Controller
              control={control}
              name="rating"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="rating">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['1', '2', '3', '4', '5'].map((value) => (
                      <SelectItem key={value} value={value}>
                        {value} / 5
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="comments">Comments</Label>
            <Textarea id="comments" rows={3} {...register('comments')} />
          </div>
          <Controller
            control={control}
            name="interested_in_purchasing"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                Interested in purchasing
              </label>
            )}
          />
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
