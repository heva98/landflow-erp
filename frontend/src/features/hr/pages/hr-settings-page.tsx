import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { DepartmentDialog } from '../components/department-dialog'
import { LeaveTypeDialog } from '../components/leave-type-dialog'
import { useDepartmentsQuery, useLeaveTypesQuery } from '../hooks/use-hr'
import { canManageDepartments, canManageLeaveTypes } from '../lib/permissions'

function DepartmentsTab() {
  const { user } = useAuth()
  const canManage = canManageDepartments(user?.permissions)
  const { data, isLoading } = useDepartmentsQuery()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">{canManage && <DepartmentDialog />}</div>
      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Employees</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">Loading…</TableCell>
              </TableRow>
            )}
            {data && data.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">No departments yet.</TableCell>
              </TableRow>
            )}
            {data?.results.map((department) => (
              <TableRow key={department.id}>
                <TableCell className="font-medium text-foreground">{department.name}</TableCell>
                <TableCell>{department.manager_name ?? '—'}</TableCell>
                <TableCell>{department.employee_count}</TableCell>
                <TableCell className="text-right">{canManage && <DepartmentDialog department={department} />}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function LeaveTypesTab() {
  const { user } = useAuth()
  const canManage = canManageLeaveTypes(user?.permissions)
  const { data, isLoading } = useLeaveTypesQuery()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">{canManage && <LeaveTypeDialog />}</div>
      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Default days/year</TableHead>
              <TableHead>Paid</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">Loading…</TableCell>
              </TableRow>
            )}
            {data && data.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">No leave types yet.</TableCell>
              </TableRow>
            )}
            {data?.results.map((leaveType) => (
              <TableRow key={leaveType.id}>
                <TableCell className="font-medium text-foreground">{leaveType.name}</TableCell>
                <TableCell>{leaveType.default_days_per_year}</TableCell>
                <TableCell>{leaveType.is_paid ? 'Yes' : 'No'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export function HrSettingsPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/hr/employees')} aria-label="Back to employees">
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">HR settings</h1>
      </div>

      <Tabs defaultValue="departments">
        <TabsList>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="leave-types">Leave types</TabsTrigger>
        </TabsList>
        <TabsContent value="departments">
          <DepartmentsTab />
        </TabsContent>
        <TabsContent value="leave-types">
          <LeaveTypesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
