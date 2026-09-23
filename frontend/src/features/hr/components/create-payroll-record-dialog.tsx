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

import { useCreatePayrollRecordMutation } from '../hooks/use-hr'
import { EmployeeSelect } from './selects'

const payrollSchema = z.object({
  employee: z.string().min(1, 'Select an employee'),
  pay_period_start: z.string().min(1, 'Required'),
  pay_period_end: z.string().min(1, 'Required'),
  basic_salary: z.number().nonnegative('Must be zero or more'),
  allowances: z.number().nonnegative('Must be zero or more'),
  commission_amount: z.number().nonnegative('Must be zero or more'),
  deductions: z.number().nonnegative('Must be zero or more'),
})
type PayrollValues = z.infer<typeof payrollSchema>

export function CreatePayrollRecordDialog() {
  const [open, setOpen] = useState(false)
  const createPayrollRecord = useCreatePayrollRecordMutation()

  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PayrollValues>({
    resolver: zodResolver(payrollSchema),
    defaultValues: { basic_salary: 0, allowances: 0, commission_amount: 0, deductions: 0 },
  })

  async function submit(values: PayrollValues) {
    await createPayrollRecord.mutateAsync(values)
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New payroll record
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New payroll record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label>Employee</Label>
            <Controller
              control={control}
              name="employee"
              render={({ field }) => <EmployeeSelect value={field.value ?? ''} onChange={field.onChange} />}
            />
            {errors.employee && <p className="text-sm text-destructive">{errors.employee.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pay_period_start">Period start</Label>
              <Input
                id="pay_period_start"
                type="date"
                aria-invalid={Boolean(errors.pay_period_start)}
                {...register('pay_period_start')}
              />
              {errors.pay_period_start && <p className="text-sm text-destructive">{errors.pay_period_start.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pay_period_end">Period end</Label>
              <Input
                id="pay_period_end"
                type="date"
                aria-invalid={Boolean(errors.pay_period_end)}
                {...register('pay_period_end')}
              />
              {errors.pay_period_end && <p className="text-sm text-destructive">{errors.pay_period_end.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="basic_salary">Basic salary (TZS)</Label>
              <Input
                id="basic_salary"
                type="number"
                step="0.01"
                min="0"
                {...register('basic_salary', { valueAsNumber: true })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="allowances">Allowances (TZS)</Label>
              <Input
                id="allowances"
                type="number"
                step="0.01"
                min="0"
                {...register('allowances', { valueAsNumber: true })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="commission_amount">Commission (TZS)</Label>
              <Input
                id="commission_amount"
                type="number"
                step="0.01"
                min="0"
                {...register('commission_amount', { valueAsNumber: true })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="deductions">Deductions (TZS)</Label>
              <Input
                id="deductions"
                type="number"
                step="0.01"
                min="0"
                {...register('deductions', { valueAsNumber: true })}
              />
            </div>
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
