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

import { useCreateUtilityReserveMutation } from '../hooks/use-surveys'
import { UTILITY_TYPE_LABELS, UTILITY_TYPES } from '../types'

const addUtilitySchema = z.object({
  utility_type: z.enum(UTILITY_TYPES),
  description: z.string().optional(),
  area_sqm: z.union([z.number(), z.nan()]).optional(),
})
type AddUtilityValues = z.infer<typeof addUtilitySchema>

export function AddUtilityReserveDialog({ subdivisionId }: { subdivisionId: string }) {
  const [open, setOpen] = useState(false)
  const createUtility = useCreateUtilityReserveMutation()
  const { control, register, handleSubmit, reset, formState: { isSubmitting } } = useForm<AddUtilityValues>({
    resolver: zodResolver(addUtilitySchema),
    defaultValues: { utility_type: 'water' },
  })

  async function submit(values: AddUtilityValues) {
    await createUtility.mutateAsync({
      subdivision: subdivisionId,
      utility_type: values.utility_type,
      description: values.description ?? '',
      area_sqm: Number.isFinite(values.area_sqm) ? (values.area_sqm as number) : undefined,
    })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus /> Add utility
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add utility reserve</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="utility_type">Type</Label>
            <Controller
              control={control}
              name="utility_type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="utility_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UTILITY_TYPES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {UTILITY_TYPE_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register('description')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="area_sqm">Area (sqm)</Label>
            <Input id="area_sqm" type="number" step="0.01" {...register('area_sqm', { valueAsNumber: true })} />
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
