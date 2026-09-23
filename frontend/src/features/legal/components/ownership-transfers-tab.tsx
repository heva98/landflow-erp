import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
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
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { useCreateOwnershipTransferMutation, useOwnershipTransfersQuery } from '../hooks/use-legal'
import { canManageOwnershipTransfers } from '../lib/permissions'
import { SaleSelect } from './sale-select'
import { TransferStatusBadge } from './status-badges'

const createSchema = z.object({ sale: z.string().min(1, 'Select a sale') })
type CreateValues = z.infer<typeof createSchema>

function CreateTransferDialog() {
  const [open, setOpen] = useState(false)
  const createTransfer = useCreateOwnershipTransferMutation()
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { sale: '' },
  })

  async function submit(values: CreateValues) {
    await createTransfer.mutateAsync(values)
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New ownership transfer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New ownership transfer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label>Sale</Label>
            <Controller
              control={control}
              name="sale"
              render={({ field }) => <SaleSelect value={field.value} onChange={field.onChange} />}
            />
            {errors.sale && <p className="text-sm text-destructive">{errors.sale.message}</p>}
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

export function OwnershipTransfersTab() {
  const { user } = useAuth()
  const canManage = canManageOwnershipTransfers(user?.permissions)
  const { data, isLoading } = useOwnershipTransfersQuery()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">{canManage && <CreateTransferDialog />}</div>
      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">SN</TableHead>
              <TableHead>Transfer #</TableHead>
              <TableHead>Sale</TableHead>
              <TableHead>Plot</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Completed at</TableHead>
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
                <TableCell colSpan={7} className="text-center text-muted-foreground">No ownership transfers yet.</TableCell>
              </TableRow>
            )}
            {data?.results.map((transfer, index) => (
              <TableRow key={transfer.id}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-medium text-foreground">
                  <Link to={`/legal/ownership-transfers/${transfer.id}`} className="hover:underline">
                    {transfer.transfer_number}
                  </Link>
                </TableCell>
                <TableCell>{transfer.sale_number}</TableCell>
                <TableCell>{transfer.plot_number}</TableCell>
                <TableCell>{transfer.customer_name}</TableCell>
                <TableCell>
                  <TransferStatusBadge status={transfer.status} />
                </TableCell>
                <TableCell>{transfer.completed_at ? new Date(transfer.completed_at).toLocaleString() : '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
