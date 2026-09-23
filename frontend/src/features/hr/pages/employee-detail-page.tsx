import { ArrowLeft, Pencil, UserSquare2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useAgentsQuery } from '@/features/agents/hooks/use-agents'
import { DocumentsPanel } from '@/features/documents/components/documents-panel'
import { formatTZS } from '@/lib/utils'

import { AddPerformanceReviewDialog } from '../components/add-performance-review-dialog'
import { CreatePayrollRecordDialog } from '../components/create-payroll-record-dialog'
import { EmployeeLifecycleActions } from '../components/employee-lifecycle-actions'
import { LogAttendanceDialog } from '../components/log-attendance-dialog'
import { RequestLeaveDialog } from '../components/request-leave-dialog'
import { AttendanceStatusBadge, EmployeeStatusBadge, LeaveRequestStatusBadge, PayrollStatusBadge } from '../components/status-badges'
import {
  useAttendanceQuery,
  useEmployeeQuery,
  useLeaveRequestsQuery,
  usePayrollRecordsQuery,
  usePerformanceReviewsQuery,
} from '../hooks/use-hr'
import { canManageEmployees, canManagePayroll } from '../lib/permissions'

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString('en-GB') : '—'
}

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canEdit = canManageEmployees(user?.permissions)
  const canPayroll = canManagePayroll(user?.permissions)
  const { data: employee, isLoading, isError } = useEmployeeQuery(id)
  const { data: attendance } = useAttendanceQuery({ employee: id })
  const { data: leaveRequests } = useLeaveRequestsQuery({ employee: id })
  const { data: reviews } = usePerformanceReviewsQuery({ employee: id })
  const { data: payroll } = usePayrollRecordsQuery({ employee: id })
  const { data: agentMatch } = useAgentsQuery({ employee: id })
  const agentProfile = agentMatch?.results[0]

  if (isLoading) {
    return <p className="text-muted-foreground">Loading employee…</p>
  }

  if (isError || !employee) {
    return <p className="text-destructive">Employee not found.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/hr/employees')} aria-label="Back to employees">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{employee.full_name}</h1>
            <p className="text-sm text-muted-foreground">
              {employee.employee_number} · {employee.job_title || 'No title'} · {employee.department_name ?? 'No department'}
            </p>
          </div>
          <EmployeeStatusBadge status={employee.status} />
          {agentProfile && (
            <Link to={`/agents/${agentProfile.id}`}>
              <Badge variant="info" className="gap-1">
                <UserSquare2 className="size-3" /> Also an agent · {agentProfile.agent_code}
              </Badge>
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button asChild variant="outline">
              <Link to={`/hr/employees/${employee.id}/edit`}>
                <Pencil /> Edit
              </Link>
            </Button>
          )}
          {canEdit && <EmployeeLifecycleActions employee={employee} />}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Manager</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-semibold text-foreground">{employee.manager_name ?? '—'}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Hire date</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-semibold text-foreground">{formatDate(employee.hire_date)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Phone</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-semibold text-foreground">{employee.phone || '—'}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Basic salary</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-semibold text-foreground">{formatTZS(employee.basic_salary)}</CardContent>
        </Card>
      </div>

      <Tabs defaultValue="attendance">
        <TabsList>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Attendance records</CardTitle>
              <LogAttendanceDialog employeeId={employee.id} />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check in</TableHead>
                    <TableHead>Check out</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance && attendance.results.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">No attendance records yet.</TableCell>
                    </TableRow>
                  )}
                  {attendance?.results.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>
                        <AttendanceStatusBadge status={record.status} />
                      </TableCell>
                      <TableCell>{record.check_in ?? '—'}</TableCell>
                      <TableCell>{record.check_out ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Leave requests</CardTitle>
              <RequestLeaveDialog employeeId={employee.id} />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRequests && leaveRequests.results.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">No leave requests yet.</TableCell>
                    </TableRow>
                  )}
                  {leaveRequests?.results.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.leave_type_name}</TableCell>
                      <TableCell>{formatDate(request.start_date)} – {formatDate(request.end_date)}</TableCell>
                      <TableCell>{request.requested_days}</TableCell>
                      <TableCell>
                        <LeaveRequestStatusBadge status={request.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Performance reviews</CardTitle>
              <AddPerformanceReviewDialog employeeId={employee.id} />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Reviewer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews && reviews.results.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">No reviews yet.</TableCell>
                    </TableRow>
                  )}
                  {reviews?.results.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>{formatDate(review.review_period_start)} – {formatDate(review.review_period_end)}</TableCell>
                      <TableCell>{review.rating} / 5</TableCell>
                      <TableCell>{review.reviewer_name ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Payroll history</CardTitle>
              {canPayroll && <CreatePayrollRecordDialog />}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Net pay</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payroll && payroll.results.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">No payroll records yet.</TableCell>
                    </TableRow>
                  )}
                  {payroll?.results.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{formatDate(record.pay_period_start)} – {formatDate(record.pay_period_end)}</TableCell>
                      <TableCell>{formatTZS(record.net_pay)}</TableCell>
                      <TableCell>
                        <PayrollStatusBadge status={record.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsPanel contentType="hr.employee" objectId={employee.id} title="Documents" />
        </TabsContent>
      </Tabs>

      {employee.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground">{employee.notes}</CardContent>
        </Card>
      )}
    </div>
  )
}
