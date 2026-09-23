import { Plus, Search, Settings } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { EmployeeStatusBadge } from '../components/status-badges'
import { useEmployeesQuery } from '../hooks/use-hr'
import { canManageEmployees } from '../lib/permissions'
import { EMPLOYEE_STATUS_LABELS, EMPLOYEE_STATUSES, type EmployeeStatus } from '../types'

export function EmployeesListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<EmployeeStatus | 'all'>('all')
  const { user } = useAuth()
  const canManage = canManageEmployees(user?.permissions)

  const { data, isLoading, isError } = useEmployeesQuery({
    search: search || undefined,
    status: status === 'all' ? undefined : status,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Employees</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/hr/departments">
              <Settings /> Departments
            </Link>
          </Button>
          {canManage && (
            <Button asChild>
              <Link to="/hr/employees/new">
                <Plus /> New employee
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, number, email"
            className="pl-8"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select value={status} onValueChange={(value) => setStatus(value as EmployeeStatus | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {EMPLOYEE_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {EMPLOYEE_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">SN</TableHead>
              <TableHead>Employee #</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Job title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">Loading employees…</TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-destructive">Failed to load employees.</TableCell>
              </TableRow>
            )}
            {data && data.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">No employees yet.</TableCell>
              </TableRow>
            )}
            {data?.results.map((employee, index) => (
              <TableRow key={employee.id} className="cursor-pointer" onClick={() => navigate(`/hr/employees/${employee.id}`)}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-medium text-foreground">
                  <Link to={`/hr/employees/${employee.id}`} className="hover:underline">
                    {employee.employee_number}
                  </Link>
                </TableCell>
                <TableCell>{employee.full_name}</TableCell>
                <TableCell>{employee.job_title || '—'}</TableCell>
                <TableCell>{employee.department_name ?? '—'}</TableCell>
                <TableCell>
                  <EmployeeStatusBadge status={employee.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
