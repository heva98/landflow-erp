import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { Badge } from '@/components/ui/badge'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { DriverSelectForBus } from '../components/driver-select'
import { useCreateBusMutation, useCreateDriverMutation, useBusesQuery, useDriversQuery } from '../hooks/use-site-visits'
import { canManageBuses, canManageDrivers } from '../lib/permissions'

const driverSchema = z.object({
  full_name: z.string().min(1, 'Required'),
  phone: z.string().optional(),
  license_number: z.string().optional(),
})
type DriverValues = z.infer<typeof driverSchema>

function AddDriverDialog() {
  const [open, setOpen] = useState(false)
  const createDriver = useCreateDriverMutation()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DriverValues>({
    resolver: zodResolver(driverSchema),
  })

  async function submit(values: DriverValues) {
    await createDriver.mutateAsync(values)
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> Add driver
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add driver</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" aria-invalid={Boolean(errors.full_name)} {...register('full_name')} />
            {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="license_number">License number</Label>
            <Input id="license_number" {...register('license_number')} />
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

const busSchema = z.object({
  registration_number: z.string().min(1, 'Required'),
  capacity: z.number().int().positive('Must be greater than 0'),
  driver: z.string().optional(),
})
type BusValues = z.infer<typeof busSchema>

function AddBusDialog() {
  const [open, setOpen] = useState(false)
  const createBus = useCreateBusMutation()
  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<BusValues>({
    resolver: zodResolver(busSchema),
    defaultValues: { driver: '' },
  })

  async function submit(values: BusValues) {
    await createBus.mutateAsync({ ...values, driver: values.driver || null })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> Add bus
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add bus</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="registration_number">Registration number</Label>
            <Input
              id="registration_number"
              aria-invalid={Boolean(errors.registration_number)}
              {...register('registration_number')}
            />
            {errors.registration_number && <p className="text-sm text-destructive">{errors.registration_number.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              aria-invalid={Boolean(errors.capacity)}
              {...register('capacity', { valueAsNumber: true })}
            />
            {errors.capacity && <p className="text-sm text-destructive">{errors.capacity.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Driver</Label>
            <Controller
              control={control}
              name="driver"
              render={({ field }) => <DriverSelectForBus value={field.value ?? ''} onChange={field.onChange} />}
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

export function SiteVisitsDirectoryPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const canAddDriver = canManageDrivers(user?.permissions)
  const canAddBus = canManageBuses(user?.permissions)
  const { data: drivers, isLoading: driversLoading } = useDriversQuery()
  const { data: buses, isLoading: busesLoading } = useBusesQuery()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/site-visits')} aria-label="Back to site visits">
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">Drivers &amp; buses</h1>
      </div>

      <Tabs defaultValue="drivers">
        <TabsList>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="buses">Buses</TabsTrigger>
        </TabsList>

        <TabsContent value="drivers" className="flex flex-col gap-4">
          <div className="flex justify-end">{canAddDriver && <AddDriverDialog />}</div>
          <div className="rounded-xl bg-card ring-1 ring-foreground/10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>License #</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {driversLoading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">Loading…</TableCell>
                  </TableRow>
                )}
                {drivers && drivers.results.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No drivers yet.</TableCell>
                  </TableRow>
                )}
                {drivers?.results.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium text-foreground">{driver.full_name}</TableCell>
                    <TableCell>{driver.phone || '—'}</TableCell>
                    <TableCell>{driver.license_number || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={driver.is_active ? 'success' : 'secondary'}>
                        {driver.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="buses" className="flex flex-col gap-4">
          <div className="flex justify-end">{canAddBus && <AddBusDialog />}</div>
          <div className="rounded-xl bg-card ring-1 ring-foreground/10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {busesLoading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">Loading…</TableCell>
                  </TableRow>
                )}
                {buses && buses.results.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No buses yet.</TableCell>
                  </TableRow>
                )}
                {buses?.results.map((bus) => (
                  <TableRow key={bus.id}>
                    <TableCell className="font-medium text-foreground">{bus.registration_number}</TableCell>
                    <TableCell>{bus.capacity}</TableCell>
                    <TableCell>{bus.driver_name ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={bus.is_active ? 'success' : 'secondary'}>
                        {bus.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
