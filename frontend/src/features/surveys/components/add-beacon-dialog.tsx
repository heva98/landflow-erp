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

import { useCreateBeaconMutation } from '../hooks/use-surveys'
import { BEACON_CONDITION_LABELS, BEACON_CONDITIONS, BEACON_TYPE_LABELS, BEACON_TYPES } from '../types'

const addBeaconSchema = z.object({
  beacon_number: z.string().min(1, 'Required'),
  beacon_type: z.enum(BEACON_TYPES),
  condition: z.enum(BEACON_CONDITIONS),
  latitude: z.union([z.number(), z.nan()]).optional(),
  longitude: z.union([z.number(), z.nan()]).optional(),
})
type AddBeaconValues = z.infer<typeof addBeaconSchema>

export function AddBeaconDialog({ surveyId }: { surveyId: string }) {
  const [open, setOpen] = useState(false)
  const createBeacon = useCreateBeaconMutation(surveyId)
  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddBeaconValues>({
    resolver: zodResolver(addBeaconSchema),
    defaultValues: { beacon_type: 'concrete_pillar', condition: 'intact' },
  })

  async function submit(values: AddBeaconValues) {
    await createBeacon.mutateAsync({
      survey: surveyId,
      beacon_number: values.beacon_number,
      beacon_type: values.beacon_type,
      condition: values.condition,
      latitude: Number.isFinite(values.latitude) ? (values.latitude as number) : null,
      longitude: Number.isFinite(values.longitude) ? (values.longitude as number) : null,
    })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus /> Add beacon
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add beacon</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="beacon_number">Beacon number</Label>
            <Input id="beacon_number" aria-invalid={Boolean(errors.beacon_number)} {...register('beacon_number')} />
            {errors.beacon_number && <p className="text-sm text-destructive">{errors.beacon_number.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="beacon_type">Type</Label>
            <Controller
              control={control}
              name="beacon_type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="beacon_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BEACON_TYPES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {BEACON_TYPE_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="condition">Condition</Label>
            <Controller
              control={control}
              name="condition"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="condition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BEACON_CONDITIONS.map((value) => (
                      <SelectItem key={value} value={value}>
                        {BEACON_CONDITION_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="latitude">Latitude</Label>
              <Input id="latitude" type="number" step="any" {...register('latitude', { valueAsNumber: true })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="longitude">Longitude</Label>
              <Input id="longitude" type="number" step="any" {...register('longitude', { valueAsNumber: true })} />
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
