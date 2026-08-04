import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { InstallmentStatusBadge } from '@/features/installments/components/installment-status-badge'
import { formatTZS } from '@/lib/utils'

import type { DashboardUpcomingPayments } from '../types'

export function UpcomingPaymentsCard({ data }: { data: DashboardUpcomingPayments }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Payments</CardTitle>
        <CardDescription>
          {data.count} installment{data.count === 1 ? '' : 's'} due within 30 days · {formatTZS(data.total_balance)} total
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing due in the next 30 days.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Plot</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.map((row, index) => (
                  <TableRow key={`${row.sale_number}-${index}`}>
                    <TableCell>{row.customer}</TableCell>
                    <TableCell>
                      {row.project} · {row.plot_number}
                    </TableCell>
                    <TableCell>{new Date(row.due_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">{formatTZS(row.balance)}</TableCell>
                    <TableCell>
                      <InstallmentStatusBadge status={row.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
