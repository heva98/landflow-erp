import { isAxiosError } from 'axios'
import { CalendarOff, CheckCircle2, Loader2, ShieldAlert, UserX } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

import {
  useActivateEmployeeMutation,
  usePutEmployeeOnLeaveMutation,
  useSuspendEmployeeMutation,
  useTerminateEmployeeMutation,
} from '../hooks/use-hr'
import type { Employee } from '../types'

function extractError(error: unknown): string {
  if (isAxiosError(error) && error.response?.status === 403) {
    return "You don't have permission to do that."
  }
  return 'Something went wrong. Please try again.'
}

export function EmployeeLifecycleActions({ employee }: { employee: Employee }) {
  const [error, setError] = useState<string | null>(null)
  const activate = useActivateEmployeeMutation(employee.id)
  const putOnLeave = usePutEmployeeOnLeaveMutation(employee.id)
  const suspend = useSuspendEmployeeMutation(employee.id)
  const terminate = useTerminateEmployeeMutation(employee.id)

  async function run(action: () => Promise<unknown>) {
    setError(null)
    try {
      await action()
    } catch (err) {
      setError(extractError(err))
    }
  }

  const pending = activate.isPending || putOnLeave.isPending || suspend.isPending || terminate.isPending

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {employee.status !== 'active' && employee.status !== 'terminated' && (
          <Button variant="outline" disabled={pending} onClick={() => run(() => activate.mutateAsync())}>
            <CheckCircle2 /> Activate
          </Button>
        )}
        {employee.status === 'active' && (
          <Button variant="outline" disabled={pending} onClick={() => run(() => putOnLeave.mutateAsync())}>
            <CalendarOff /> Put on leave
          </Button>
        )}
        {employee.status !== 'terminated' && (
          <Button variant="outline" disabled={pending} onClick={() => run(() => suspend.mutateAsync())}>
            <ShieldAlert /> Suspend
          </Button>
        )}
        {employee.status !== 'terminated' && (
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            disabled={pending}
            onClick={() => run(() => terminate.mutateAsync(undefined))}
          >
            {terminate.isPending ? <Loader2 className="animate-spin" /> : <UserX />}
            Terminate
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
