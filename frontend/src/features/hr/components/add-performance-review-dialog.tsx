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

import { useCreatePerformanceReviewMutation } from '../hooks/use-hr'

const reviewSchema = z.object({
  review_period_start: z.string().min(1, 'Required'),
  review_period_end: z.string().min(1, 'Required'),
  rating: z.number().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  strengths: z.string().max(2000).optional(),
  areas_for_improvement: z.string().max(2000).optional(),
  goals: z.string().max(2000).optional(),
})
type ReviewValues = z.infer<typeof reviewSchema>

export function AddPerformanceReviewDialog({ employeeId }: { employeeId: string }) {
  const [open, setOpen] = useState(false)
  const createReview = useCreatePerformanceReviewMutation()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 3 },
  })

  async function submit(values: ReviewValues) {
    await createReview.mutateAsync({ employee: employeeId, ...values })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus /> Add review
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add performance review</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="review_period_start">Period start</Label>
              <Input
                id="review_period_start"
                type="date"
                aria-invalid={Boolean(errors.review_period_start)}
                {...register('review_period_start')}
              />
              {errors.review_period_start && (
                <p className="text-sm text-destructive">{errors.review_period_start.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="review_period_end">Period end</Label>
              <Input
                id="review_period_end"
                type="date"
                aria-invalid={Boolean(errors.review_period_end)}
                {...register('review_period_end')}
              />
              {errors.review_period_end && (
                <p className="text-sm text-destructive">{errors.review_period_end.message}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rating">Rating (1–5)</Label>
            <Input
              id="rating"
              type="number"
              min="1"
              max="5"
              aria-invalid={Boolean(errors.rating)}
              {...register('rating', { valueAsNumber: true })}
            />
            {errors.rating && <p className="text-sm text-destructive">{errors.rating.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="strengths">Strengths</Label>
            <Textarea id="strengths" rows={2} {...register('strengths')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="areas_for_improvement">Areas for improvement</Label>
            <Textarea id="areas_for_improvement" rows={2} {...register('areas_for_improvement')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goals">Goals</Label>
            <Textarea id="goals" rows={2} {...register('goals')} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Add review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
