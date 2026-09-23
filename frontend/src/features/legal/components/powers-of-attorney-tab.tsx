import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { ActionPromptDialog } from '@/components/action-prompt-dialog'
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
import { useAuth } from '@/features/auth/hooks/use-auth'

import {
  useApprovePoaMutation,
  useCreatePowerOfAttorneyMutation,
  useExpirePoaMutation,
  usePowersOfAttorneyQuery,
  useRevokePoaMutation,
} from '../hooks/use-legal'
import { canApprovePowersOfAttorney, canManagePowersOfAttorney } from '../lib/permissions'
import type { PowerOfAttorney } from '../types'
import { SaleSelect } from './sale-select'
import { PoaStatusBadge } from './status-badges'

const createSchema = z.object({
  grantor_name: z.string().min(1, 'Required'),
  grantee_name: z.string().min(1, 'Required'),
  sale: z.string().optional(),
})
type CreateValues = z.infer<typeof createSchema>

function CreatePoaDialog() {
  const [open, setOpen] = useState(false)
  const createPoa = useCreatePowerOfAttorneyMutation()
  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { grantor_name: '', grantee_name: '', sale: '' },
  })

  async function submit(values: CreateValues) {
    await createPoa.mutateAsync({ ...values, sale: values.sale || undefined })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New power of attorney
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New power of attorney</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="grantor_name">Grantor</Label>
            <Input id="grantor_name" aria-invalid={Boolean(errors.grantor_name)} {...register('grantor_name')} />
            {errors.grantor_name && <p className="text-sm text-destructive">{errors.grantor_name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="grantee_name">Grantee</Label>
            <Input id="grantee_name" aria-invalid={Boolean(errors.grantee_name)} {...register('grantee_name')} />
            {errors.grantee_name && <p className="text-sm text-destructive">{errors.grantee_name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Related sale (optional)</Label>
            <Controller
              control={control}
              name="sale"
              render={({ field }) => <SaleSelect value={field.value ?? ''} onChange={field.onChange} />}
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

function PoaActions({ poa }: { poa: PowerOfAttorney }) {
  const { user } = useAuth()
  const canApprove = canApprovePowersOfAttorney(user?.permissions)
  const canManage = canManagePowersOfAttorney(user?.permissions)
  const approve = useApprovePoaMutation(poa.id)
  const revoke = useRevokePoaMutation(poa.id)
  const expire = useExpirePoaMutation(poa.id)

  return (
    <div className="flex items-center justify-end gap-2">
      {canApprove && poa.status === 'pending' && (
        <Button size="sm" disabled={approve.isPending} onClick={() => approve.mutate()}>
          Approve
        </Button>
      )}
      {canManage && poa.status === 'active' && (
        <Button size="sm" variant="outline" disabled={expire.isPending} onClick={() => expire.mutate()}>
          Mark expired
        </Button>
      )}
      {canApprove && poa.status === 'active' && (
        <ActionPromptDialog
          trigger={<Button size="sm" variant="destructive">Revoke</Button>}
          title="Revoke power of attorney"
          label="Reason"
          confirmLabel="Revoke"
          destructive
          onConfirm={(value) => revoke.mutateAsync(value)}
        />
      )}
    </div>
  )
}

export function PowersOfAttorneyTab() {
  const { user } = useAuth()
  const canManage = canManagePowersOfAttorney(user?.permissions)
  const { data, isLoading } = usePowersOfAttorneyQuery()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">{canManage && <CreatePoaDialog />}</div>
      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">SN</TableHead>
              <TableHead>POA #</TableHead>
              <TableHead>Grantor</TableHead>
              <TableHead>Grantee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">Loading…</TableCell>
              </TableRow>
            )}
            {data && data.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">No powers of attorney yet.</TableCell>
              </TableRow>
            )}
            {data?.results.map((poa, index) => (
              <TableRow key={poa.id}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-medium text-foreground">{poa.poa_number}</TableCell>
                <TableCell>{poa.grantor_name}</TableCell>
                <TableCell>{poa.grantee_name}</TableCell>
                <TableCell>
                  <PoaStatusBadge status={poa.status} />
                </TableCell>
                <TableCell>{poa.expiry_date ?? '—'}</TableCell>
                <TableCell>
                  <PoaActions poa={poa} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
