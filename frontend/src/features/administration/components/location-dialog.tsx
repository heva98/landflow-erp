import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { Loader2, Pencil, Plus } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useCreateLocationMutation, useUpdateLocationMutation } from '../hooks/use-administration'
import { LOCATION_TYPE_LABELS, LOCATION_TYPES, type Location, type LocationType } from '../types'
import { LocationSelect } from './location-select'

const locationSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(150),
    location_type: z.enum(LOCATION_TYPES),
    parent: z.string().optional(),
    is_active: z.boolean().optional(),
  })
  .refine((data) => data.location_type === 'region' || Boolean(data.parent), {
    message: 'A parent location is required',
    path: ['parent'],
  })
type LocationValues = z.infer<typeof locationSchema>

const PARENT_TYPE: Partial<Record<LocationType, LocationType>> = { district: 'region', ward: 'district' }

function extractError(error: unknown): string {
  if (isAxiosError(error) && error.response?.data) {
    const data = error.response.data as Record<string, string[] | string>
    const first = Object.values(data)[0]
    return Array.isArray(first) ? first[0] : String(first)
  }
  return 'Something went wrong. Please try again.'
}

export function LocationDialog({ location }: { location?: Location }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const createLocation = useCreateLocationMutation()
  const updateLocation = useUpdateLocationMutation(location?.id ?? '')

  const { control, register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<LocationValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: location?.name ?? '',
      location_type: location?.location_type ?? 'region',
      parent: location?.parent ?? '',
      is_active: location?.is_active ?? true,
    },
  })
  const locationType = watch('location_type')
  const parentType = PARENT_TYPE[locationType]

  async function submit(values: LocationValues) {
    setError(null)
    const input = { ...values, parent: locationType === 'region' ? null : values.parent || null }
    try {
      if (location) {
        await updateLocation.mutateAsync(input)
      } else {
        await createLocation.mutateAsync(input)
      }
      setOpen(false)
      reset()
    } catch (err) {
      setError(extractError(err))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {location ? (
          <Button size="icon" variant="ghost" aria-label="Edit location">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button size="sm">
            <Plus /> New location
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{location ? 'Edit location' : 'New location'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label>Type</Label>
            <Controller
              control={control}
              name="location_type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_TYPES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {LOCATION_TYPE_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" aria-invalid={Boolean(errors.name)} {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          {parentType && (
            <div className="flex flex-col gap-1.5">
              <Label>{LOCATION_TYPE_LABELS[parentType]}</Label>
              <Controller
                control={control}
                name="parent"
                render={({ field }) => (
                  <LocationSelect
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    locationType={parentType}
                    placeholder={`Select a ${LOCATION_TYPE_LABELS[parentType].toLowerCase()}`}
                  />
                )}
              />
              {errors.parent && <p className="text-sm text-destructive">{errors.parent.message}</p>}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Controller
              control={control}
              name="is_active"
              render={({ field }) => <Checkbox id="is_active" checked={field.value} onCheckedChange={field.onChange} />}
            />
            <Label htmlFor="is_active" className="font-normal">Active</Label>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {location ? 'Save changes' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
