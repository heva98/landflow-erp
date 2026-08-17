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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { useActivateContractMutation, useContractsQuery, useCreateContractMutation, useTerminateContractMutation } from '../hooks/use-legal'
import { canManageContracts } from '../lib/permissions'
import { CONTRACT_TYPE_LABELS, CONTRACT_TYPES, type Contract } from '../types'
import { ContractStatusBadge } from './status-badges'

const createSchema = z.object({
  title: z.string().min(1, 'Required'),
  contract_type: z.enum(CONTRACT_TYPES),
  counterparty_name: z.string().min(1, 'Required'),
})
type CreateValues = z.infer<typeof createSchema>

function CreateContractDialog() {
  const [open, setOpen] = useState(false)
  const createContract = useCreateContractMutation()
  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { title: '', contract_type: 'other', counterparty_name: '' },
  })

  async function submit(values: CreateValues) {
    await createContract.mutateAsync(values)
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New contract
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New contract</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" aria-invalid={Boolean(errors.title)} {...register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contract_type">Type</Label>
            <Controller
              control={control}
              name="contract_type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="contract_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_TYPES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {CONTRACT_TYPE_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="counterparty_name">Counterparty</Label>
            <Input id="counterparty_name" aria-invalid={Boolean(errors.counterparty_name)} {...register('counterparty_name')} />
            {errors.counterparty_name && <p className="text-sm text-destructive">{errors.counterparty_name.message}</p>}
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

function ContractActions({ contract }: { contract: Contract }) {
  const { user } = useAuth()
  const canManage = canManageContracts(user?.permissions)
  const activate = useActivateContractMutation(contract.id)
  const terminate = useTerminateContractMutation(contract.id)

  if (!canManage) return null

  return (
    <div className="flex items-center justify-end gap-2">
      {contract.status === 'draft' && (
        <Button size="sm" variant="outline" disabled={activate.isPending} onClick={() => activate.mutate()}>
          Activate
        </Button>
      )}
      {contract.status === 'active' && (
        <Button size="sm" variant="destructive" disabled={terminate.isPending} onClick={() => terminate.mutate()}>
          Terminate
        </Button>
      )}
    </div>
  )
}

export function ContractsTab() {
  const { user } = useAuth()
  const canManage = canManageContracts(user?.permissions)
  const { data, isLoading } = useContractsQuery()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">{canManage && <CreateContractDialog />}</div>
      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract #</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Counterparty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">Loading…</TableCell>
              </TableRow>
            )}
            {data && data.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">No contracts yet.</TableCell>
              </TableRow>
            )}
            {data?.results.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell className="font-medium text-foreground">{contract.contract_number}</TableCell>
                <TableCell>{contract.title}</TableCell>
                <TableCell>{CONTRACT_TYPE_LABELS[contract.contract_type]}</TableCell>
                <TableCell>{contract.counterparty_name}</TableCell>
                <TableCell>
                  <ContractStatusBadge status={contract.status} />
                </TableCell>
                <TableCell>
                  <ContractActions contract={contract} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
