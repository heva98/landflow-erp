import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
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

import { useCreateLandOwnerMutation } from '../hooks/use-acquisitions'

const addOwnerSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(255),
  national_id: z.string().max(50).optional(),
  phone: z.string().max(30).optional(),
  email: z.union([z.string().email('Enter a valid email'), z.literal('')]).optional(),
  address: z.string().max(255).optional(),
  ownership_percentage: z.number().min(0).max(100),
})

type AddOwnerValues = z.infer<typeof addOwnerSchema>

export function AddOwnerDialog({ acquisitionId }: { acquisitionId: string }) {
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const createOwner = useCreateLandOwnerMutation(acquisitionId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddOwnerValues>({
    resolver: zodResolver(addOwnerSchema),
    defaultValues: { ownership_percentage: 100 },
  })

  async function submit(values: AddOwnerValues) {
    setFormError(null)
    try {
      await createOwner.mutateAsync({
        acquisition: acquisitionId,
        full_name: values.full_name,
        national_id: values.national_id ?? '',
        phone: values.phone ?? '',
        email: values.email ?? '',
        address: values.address ?? '',
        ownership_percentage: values.ownership_percentage,
      })
      setOpen(false)
      reset()
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 403) {
        setFormError("You don't have permission to do that.")
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus /> Add owner
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add land owner</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" aria-invalid={Boolean(errors.full_name)} {...register('full_name')} />
            {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="national_id">National ID</Label>
              <Input id="national_id" {...register('national_id')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register('phone')} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" aria-invalid={Boolean(errors.email)} {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register('address')} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ownership_percentage">Ownership %</Label>
            <Input
              id="ownership_percentage"
              type="number"
              step="0.01"
              min="0"
              max="100"
              aria-invalid={Boolean(errors.ownership_percentage)}
              {...register('ownership_percentage', { valueAsNumber: true })}
            />
            {errors.ownership_percentage && (
              <p className="text-sm text-destructive">{errors.ownership_percentage.message}</p>
            )}
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Add owner
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
