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

import { useCreateSubdivisionPlotMutation } from '../hooks/use-surveys'
import { LAND_USE_LABELS, LAND_USES } from '../types'

const addPlotSchema = z.object({
  plot_number: z.string().min(1, 'Required'),
  block: z.string().optional(),
  street: z.string().optional(),
  area_sqm: z.number().positive('Area must be greater than 0'),
  land_use: z.enum(LAND_USES),
})
type AddPlotValues = z.infer<typeof addPlotSchema>

export function AddSubdivisionPlotDialog({ subdivisionId }: { subdivisionId: string }) {
  const [open, setOpen] = useState(false)
  const createPlot = useCreateSubdivisionPlotMutation()
  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddPlotValues>({
    resolver: zodResolver(addPlotSchema),
    defaultValues: { land_use: 'residential' },
  })

  async function submit(values: AddPlotValues) {
    await createPlot.mutateAsync({ subdivision: subdivisionId, ...values })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus /> Add planned plot
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add planned plot</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plot_number">Plot number</Label>
            <Input id="plot_number" aria-invalid={Boolean(errors.plot_number)} {...register('plot_number')} />
            {errors.plot_number && <p className="text-sm text-destructive">{errors.plot_number.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="block">Block</Label>
              <Input id="block" {...register('block')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="street">Street</Label>
              <Input id="street" {...register('street')} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="area_sqm">Area (sqm)</Label>
            <Input
              id="area_sqm"
              type="number"
              step="0.01"
              min="0"
              aria-invalid={Boolean(errors.area_sqm)}
              {...register('area_sqm', { valueAsNumber: true })}
            />
            {errors.area_sqm && <p className="text-sm text-destructive">{errors.area_sqm.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="land_use">Land use</Label>
            <Controller
              control={control}
              name="land_use"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="land_use">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LAND_USES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {LAND_USE_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
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
