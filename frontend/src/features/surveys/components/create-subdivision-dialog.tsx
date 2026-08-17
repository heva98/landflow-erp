import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
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

import { useCreateSubdivisionMutation } from '../hooks/use-surveys'

const createSubdivisionSchema = z.object({
  plan_number: z.string().optional(),
  gross_area_sqm: z.union([z.number(), z.nan()]).optional(),
})
type CreateSubdivisionValues = z.infer<typeof createSubdivisionSchema>

export function CreateSubdivisionDialog({ surveyId }: { surveyId: string }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const createSubdivision = useCreateSubdivisionMutation(surveyId)
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CreateSubdivisionValues>({
    resolver: zodResolver(createSubdivisionSchema),
  })

  async function submit(values: CreateSubdivisionValues) {
    await createSubdivision.mutateAsync({
      survey: surveyId,
      plan_number: values.plan_number || undefined,
      gross_area_sqm: Number.isFinite(values.gross_area_sqm) ? (values.gross_area_sqm as number) : undefined,
    })
    setOpen(false)
    reset()
    navigate(`/surveys/${surveyId}/subdivision`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> Create subdivision
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create subdivision</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plan_number">Plan number</Label>
            <Input id="plan_number" {...register('plan_number')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="gross_area_sqm">Gross area (sqm)</Label>
            <Input
              id="gross_area_sqm"
              type="number"
              step="0.01"
              min="0"
              {...register('gross_area_sqm', { valueAsNumber: true })}
            />
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
