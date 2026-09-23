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
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'

import {
  useApplyTitleDeedMutation,
  useApproveTitleDeedMutation,
  useCreateTitleDeedMutation,
  useMarkTitleDeedIssuedMutation,
  useTitleDeedsQuery,
} from '../hooks/use-legal'
import { canApproveTitleDeeds, canManageTitleDeeds } from '../lib/permissions'
import type { TitleDeed } from '../types'
import { SaleSelect } from './sale-select'
import { TitleDeedStatusBadge } from './status-badges'

const createSchema = z.object({ sale: z.string().min(1, 'Select a sale') })
type CreateValues = z.infer<typeof createSchema>

function CreateTitleDeedDialog() {
  const [open, setOpen] = useState(false)
  const createDeed = useCreateTitleDeedMutation()
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { sale: '' },
  })

  async function submit(values: CreateValues) {
    await createDeed.mutateAsync(values)
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New title deed
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New title deed</DialogTitle>
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

function TitleDeedActions({ deed }: { deed: TitleDeed }) {
  const { user } = useAuth()
  const canManage = canManageTitleDeeds(user?.permissions)
  const canApprove = canApproveTitleDeeds(user?.permissions)
  const apply = useApplyTitleDeedMutation(deed.id)
  const markIssued = useMarkTitleDeedIssuedMutation(deed.id)
  const approve = useApproveTitleDeedMutation(deed.id)

  return (
    <div className="flex items-center justify-end gap-2">
      {canManage && deed.status === 'pending' && (
        <ActionPromptDialog
          trigger={<Button size="sm" variant="outline">Apply</Button>}
          title="Apply for title deed"
          label="Registry office"
          placeholder="e.g. Kinondoni Land Registry"
          onConfirm={(value) => apply.mutateAsync(value)}
        />
      )}
      {canManage && deed.status === 'applied' && (
        <ActionPromptDialog
          trigger={<Button size="sm" variant="outline">Mark issued</Button>}
          title="Mark title deed issued"
          label="Deed number"
          placeholder="Deed number from the registry"
          required
          confirmLabel="Mark issued"
          onConfirm={(value) => markIssued.mutateAsync(value)}
        />
      )}
      {canApprove && deed.status === 'issued' && (
        <Button size="sm" disabled={approve.isPending} onClick={() => approve.mutate()}>
          Approve
        </Button>
      )}
    </div>
  )
}

export function TitleDeedsTab() {
  const { user } = useAuth()
  const canManage = canManageTitleDeeds(user?.permissions)
  const { data, isLoading } = useTitleDeedsQuery()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">{canManage && <CreateTitleDeedDialog />}</div>
      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">SN</TableHead>
              <TableHead>Sale</TableHead>
              <TableHead>Deed number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registry office</TableHead>
              <TableHead>Issued date</TableHead>
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
                <TableCell colSpan={7} className="text-center text-muted-foreground">No title deeds yet.</TableCell>
              </TableRow>
            )}
            {data?.results.map((deed, index) => (
              <TableRow key={deed.id}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-medium text-foreground">{deed.sale_number}</TableCell>
                <TableCell>{deed.deed_number || '—'}</TableCell>
                <TableCell>
                  <TitleDeedStatusBadge status={deed.status} />
                </TableCell>
                <TableCell>{deed.registry_office || '—'}</TableCell>
                <TableCell>{deed.issued_date ?? '—'}</TableCell>
                <TableCell>
                  <TitleDeedActions deed={deed} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
