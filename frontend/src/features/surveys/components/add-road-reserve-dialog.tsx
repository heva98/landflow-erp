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

import { useCreateRoadReserveMutation } from '../hooks/use-surveys'
import { ROAD_TYPE_LABELS, ROAD_TYPES } from '../types'

const addRoadSchema = z.object({
  name: z.string().min(1, 'Required'),
  road_type: z.enum(ROAD_TYPES),
  width_m: z.union([z.number(), z.nan()]).optional(),
  length_m: z.union([z.number(), z.nan()]).optional(),
})
type AddRoadValues = z.infer<typeof addRoadSchema>

export function AddRoadReserveDialog({ subdivisionId }: { subdivisionId: string }) {
  const [open, setOpen] = useState(false)
  const createRoad = useCreateRoadReserveMutation()
  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddRoadValues>({
    resolver: zodResolver(addRoadSchema),
    defaultValues: { road_type: 'access' },
  })

  async function submit(values: AddRoadValues) {
    await createRoad.mutateAsync({
      subdivision: subdivisionId,
      name: values.name,
      road_type: values.road_type,
      width_m: Number.isFinite(values.width_m) ? (values.width_m as number) : undefined,
      length_m: Number.isFinite(values.length_m) ? (values.length_m as number) : undefined,
    })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus /> Add road
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add road reserve</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" aria-invalid={Boolean(errors.name)} {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="road_type">Type</Label>
            <Controller
              control={control}
              name="road_type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="road_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROAD_TYPES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {ROAD_TYPE_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="width_m">Width (m)</Label>
              <Input id="width_m" type="number" step="0.01" {...register('width_m', { valueAsNumber: true })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="length_m">Length (m)</Label>
              <Input id="length_m" type="number" step="0.01" {...register('length_m', { valueAsNumber: true })} />
            </div>
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
