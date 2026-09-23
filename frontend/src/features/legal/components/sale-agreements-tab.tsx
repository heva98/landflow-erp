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
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/features/auth/hooks/use-auth'

import {
  useApproveAgreementMutation,
  useCreateSaleAgreementMutation,
  useMarkAgreementSignedMutation,
  useSaleAgreementsQuery,
  useSendAgreementForSignatureMutation,
  useVoidAgreementMutation,
} from '../hooks/use-legal'
import { canApproveSaleAgreements, canManageSaleAgreements } from '../lib/permissions'
import type { SaleAgreement } from '../types'
import { SaleAgreementStatusBadge } from './status-badges'
import { SaleSelect } from './sale-select'

const createSchema = z.object({
  sale: z.string().min(1, 'Select a sale'),
  terms: z.string().optional(),
})
type CreateValues = z.infer<typeof createSchema>

function CreateSaleAgreementDialog() {
  const [open, setOpen] = useState(false)
  const createAgreement = useCreateSaleAgreementMutation()
  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { sale: '' },
  })

  async function submit(values: CreateValues) {
    await createAgreement.mutateAsync(values)
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New agreement
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New sale agreement</DialogTitle>
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
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="terms">Terms</Label>
            <Textarea id="terms" rows={3} {...register('terms')} />
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

function AgreementActions({ agreement }: { agreement: SaleAgreement }) {
  const { user } = useAuth()
  const canManage = canManageSaleAgreements(user?.permissions)
  const canApprove = canApproveSaleAgreements(user?.permissions)
  const sendForSignature = useSendAgreementForSignatureMutation(agreement.id)
  const markSigned = useMarkAgreementSignedMutation(agreement.id)
  const approve = useApproveAgreementMutation(agreement.id)
  const voidAgreement = useVoidAgreementMutation(agreement.id)

  return (
    <div className="flex items-center justify-end gap-2">
      {canManage && agreement.status === 'draft' && (
        <Button size="sm" variant="outline" disabled={sendForSignature.isPending} onClick={() => sendForSignature.mutate()}>
          Send for signature
        </Button>
      )}
      {canManage && agreement.status === 'sent_for_signature' && (
        <Button size="sm" variant="outline" disabled={markSigned.isPending} onClick={() => markSigned.mutate()}>
          Mark signed
        </Button>
      )}
      {canApprove && agreement.status === 'signed' && (
        <Button size="sm" disabled={approve.isPending} onClick={() => approve.mutate()}>
          Approve
        </Button>
      )}
      {canApprove && agreement.status !== 'void' && (
        <ActionPromptDialog
          trigger={<Button size="sm" variant="destructive">Void</Button>}
          title="Void sale agreement"
          label="Reason"
          placeholder="Why is this agreement being voided?"
          confirmLabel="Void"
          destructive
          onConfirm={(value) => voidAgreement.mutateAsync(value)}
        />
      )}
    </div>
  )
}

export function SaleAgreementsTab() {
  const { user } = useAuth()
  const canManage = canManageSaleAgreements(user?.permissions)
  const { data, isLoading } = useSaleAgreementsQuery()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">{canManage && <CreateSaleAgreementDialog />}</div>
      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agreement #</TableHead>
              <TableHead>Sale</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Signed date</TableHead>
              <TableHead>Prepared by</TableHead>
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
                <TableCell colSpan={6} className="text-center text-muted-foreground">No sale agreements yet.</TableCell>
              </TableRow>
            )}
            {data?.results.map((agreement) => (
              <TableRow key={agreement.id}>
                <TableCell className="font-medium text-foreground">{agreement.agreement_number}</TableCell>
                <TableCell>{agreement.sale_number}</TableCell>
                <TableCell>
                  <SaleAgreementStatusBadge status={agreement.status} />
                </TableCell>
                <TableCell>{agreement.signed_date ?? '—'}</TableCell>
                <TableCell>{agreement.prepared_by_name ?? '—'}</TableCell>
                <TableCell>
                  <AgreementActions agreement={agreement} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
