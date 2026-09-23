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

import { useCreateWitnessMutation } from '../hooks/use-legal'

const addWitnessSchema = z.object({
  full_name: z.string().min(1, 'Required'),
  national_id: z.string().optional(),
  phone: z.string().optional(),
})
type AddWitnessValues = z.infer<typeof addWitnessSchema>

export function AddWitnessDialog({
  contentType,
  objectId,
  invalidateKey = ['legal-witnesses', contentType, objectId],
}: {
  contentType: string
  objectId: string
  /** Query key to refetch after adding — defaults to the standalone witnesses list, but pass the parent record's own key (e.g. ['ownership-transfers', id]) when witnesses are nested in it instead. */
  invalidateKey?: unknown[]
}) {
  const [open, setOpen] = useState(false)
  const createWitness = useCreateWitnessMutation(invalidateKey)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddWitnessValues>({
    resolver: zodResolver(addWitnessSchema),
  })

  async function submit(values: AddWitnessValues) {
    await createWitness.mutateAsync({ content_type: contentType, object_id: objectId, ...values })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus /> Add witness
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add witness</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" aria-invalid={Boolean(errors.full_name)} {...register('full_name')} />
            {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="national_id">National ID</Label>
            <Input id="national_id" {...register('national_id')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} />
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
