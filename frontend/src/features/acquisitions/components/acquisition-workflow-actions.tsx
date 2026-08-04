import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { CheckCircle2, Loader2, Rocket, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
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
import { Textarea } from '@/components/ui/textarea'

import {
  useApproveAcquisitionMutation,
  useCancelAcquisitionMutation,
  useMarkAcquisitionPurchasedMutation,
  useSpawnProjectMutation,
} from '../hooks/use-acquisitions'
import type { LandAcquisition } from '../types'

function ErrorText({ error }: { error: string | null }) {
  if (!error) return null
  return <p className="text-sm text-destructive">{error}</p>
}

function extractError(error: unknown): string {
  if (isAxiosError(error) && error.response?.status === 403) {
    return "You don't have permission to do that."
  }
  if (isAxiosError(error) && error.response?.data) {
    const detail = error.response.data
    const message =
      typeof detail === 'object' && detail ? Object.values(detail).flat().join(' ') : String(detail)
    if (message) return message
  }
  return 'Something went wrong. Please try again.'
}

function ApproveButton({ acquisition }: { acquisition: LandAcquisition }) {
  const [error, setError] = useState<string | null>(null)
  const approve = useApproveAcquisitionMutation(acquisition.id)

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        disabled={approve.isPending}
        onClick={async () => {
          setError(null)
          try {
            await approve.mutateAsync()
          } catch (err) {
            setError(extractError(err))
          }
        }}
      >
        {approve.isPending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
        Approve
      </Button>
      <ErrorText error={error} />
    </div>
  )
}

const markPurchasedSchema = z.object({
  purchase_price: z.number().positive('Purchase price must be greater than 0'),
  purchased_at: z.string().optional(),
})
type MarkPurchasedValues = z.infer<typeof markPurchasedSchema>

function MarkPurchasedButton({ acquisition }: { acquisition: LandAcquisition }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const markPurchased = useMarkAcquisitionPurchasedMutation(acquisition.id)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MarkPurchasedValues>({
    resolver: zodResolver(markPurchasedSchema),
    defaultValues: { purchase_price: Number(acquisition.purchase_price) || undefined },
  })

  async function submit(values: MarkPurchasedValues) {
    setError(null)
    try {
      await markPurchased.mutateAsync({
        purchase_price: values.purchase_price,
        purchased_at: values.purchased_at || undefined,
      })
      setOpen(false)
      reset()
    } catch (err) {
      setError(extractError(err))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <CheckCircle2 /> Mark purchased
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as purchased</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="purchase_price">Final purchase price (TZS)</Label>
            <Input
              id="purchase_price"
              type="number"
              step="0.01"
              min="0"
              aria-invalid={Boolean(errors.purchase_price)}
              {...register('purchase_price', { valueAsNumber: true })}
            />
            {errors.purchase_price && <p className="text-sm text-destructive">{errors.purchase_price.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="purchased_at">Purchase date</Label>
            <Input id="purchased_at" type="date" {...register('purchased_at')} />
          </div>
          <ErrorText error={error} />
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Confirm purchase
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const cancelSchema = z.object({ cancellation_reason: z.string().max(2000).optional() })
type CancelValues = z.infer<typeof cancelSchema>

function CancelButton({ acquisition }: { acquisition: LandAcquisition }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cancel = useCancelAcquisitionMutation(acquisition.id)

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CancelValues>({ resolver: zodResolver(cancelSchema) })

  async function submit(values: CancelValues) {
    setError(null)
    try {
      await cancel.mutateAsync({ cancellation_reason: values.cancellation_reason ?? '' })
      setOpen(false)
      reset()
    } catch (err) {
      setError(extractError(err))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-destructive hover:text-destructive">
          <XCircle /> Cancel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel acquisition</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cancellation_reason">Reason</Label>
            <Textarea id="cancellation_reason" rows={3} {...register('cancellation_reason')} />
          </div>
          <ErrorText error={error} />
          <DialogFooter>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Confirm cancellation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SpawnProjectButton({ acquisition }: { acquisition: LandAcquisition }) {
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const spawnProject = useSpawnProjectMutation(acquisition.id)

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        disabled={spawnProject.isPending}
        onClick={async () => {
          setError(null)
          try {
            const result = await spawnProject.mutateAsync()
            if (result.project) {
              navigate(`/projects/${result.project}`)
            }
          } catch (err) {
            setError(extractError(err))
          }
        }}
      >
        {spawnProject.isPending ? <Loader2 className="animate-spin" /> : <Rocket />}
        Spawn project
      </Button>
      <ErrorText error={error} />
    </div>
  )
}

export function AcquisitionWorkflowActions({ acquisition }: { acquisition: LandAcquisition }) {
  const { status } = acquisition

  return (
    <div className="flex flex-wrap items-start justify-end gap-2">
      {(status === 'potential' || status === 'negotiating') && <ApproveButton acquisition={acquisition} />}
      {status === 'approved' && <MarkPurchasedButton acquisition={acquisition} />}
      {(status === 'approved' || status === 'purchased') && !acquisition.project && (
        <SpawnProjectButton acquisition={acquisition} />
      )}
      {status !== 'purchased' && status !== 'cancelled' && <CancelButton acquisition={acquisition} />}
    </div>
  )
}
