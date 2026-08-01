import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn, formatTZS } from '@/lib/utils'

import { useCashFlowQuery, useProfitAndLossQuery } from '../hooks/use-finance'
import { CASH_BANK_KIND_LABELS } from '../types'

type ReportType = 'profit-and-loss' | 'cash-flow'

function firstOfMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function FinanceReportsPage() {
  const [report, setReport] = useState<ReportType>('profit-and-loss')
  const [dateFrom, setDateFrom] = useState(firstOfMonth())
  const [dateTo, setDateTo] = useState(today())

  const profitAndLoss = useProfitAndLossQuery(dateFrom, dateTo)
  const cashFlow = useCashFlowQuery(dateFrom, dateTo)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-foreground">Finance reports</h1>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex w-fit rounded-lg bg-card p-1 ring-1 ring-foreground/10">
          {(
            [
              ['profit-and-loss', 'Profit & Loss'],
              ['cash-flow', 'Cash Flow'],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setReport(value)}
              className={cn(
                'rounded-md',
                report === value ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground' : '',
              )}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_from">From</Label>
          <Input id="date_from" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_to">To</Label>
          <Input id="date_to" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
        </div>
      </div>

      {report === 'profit-and-loss' ? (
        <ProfitAndLossView isLoading={profitAndLoss.isLoading} isError={profitAndLoss.isError} data={profitAndLoss.data} />
      ) : (
        <CashFlowView isLoading={cashFlow.isLoading} isError={cashFlow.isError} data={cashFlow.data} />
      )}
    </div>
  )
}

function ProfitAndLossView({
  isLoading,
  isError,
  data,
}: {
  isLoading: boolean
  isError: boolean
  data: ReturnType<typeof useProfitAndLossQuery>['data']
}) {
  if (isLoading) return <p className="text-muted-foreground">Loading…</p>
  if (isError || !data) return <p className="text-destructive">Failed to load the profit &amp; loss report.</p>

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total income</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">{formatTZS(data.total_income)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total expenses</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">{formatTZS(data.total_expense)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net profit</CardTitle>
          </CardHeader>
          <CardContent
            className={cn('text-xl font-semibold', Number(data.net_profit) >= 0 ? 'text-accent' : 'text-destructive')}
          >
            {formatTZS(data.net_profit)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income by account</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.income.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    No income in this period.
                  </TableCell>
                </TableRow>
              )}
              {data.income.map((line) => (
                <TableRow key={line.account}>
                  <TableCell>
                    {line.code} - {line.name}
                  </TableCell>
                  <TableCell>{formatTZS(line.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expenses by account</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.expenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    No expenses in this period.
                  </TableCell>
                </TableRow>
              )}
              {data.expenses.map((line) => (
                <TableRow key={line.account}>
                  <TableCell>
                    {line.code} - {line.name}
                  </TableCell>
                  <TableCell>{formatTZS(line.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function CashFlowView({
  isLoading,
  isError,
  data,
}: {
  isLoading: boolean
  isError: boolean
  data: ReturnType<typeof useCashFlowQuery>['data']
}) {
  if (isLoading) return <p className="text-muted-foreground">Loading…</p>
  if (isError || !data) return <p className="text-destructive">Failed to load the cash flow report.</p>

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total inflow</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">{formatTZS(data.total_inflow)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total outflow</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">{formatTZS(data.total_outflow)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net cash flow</CardTitle>
          </CardHeader>
          <CardContent
            className={cn('text-xl font-semibold', Number(data.net_cash_flow) >= 0 ? 'text-accent' : 'text-destructive')}
          >
            {formatTZS(data.net_cash_flow)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>By cash / bank account</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead>Opening</TableHead>
                <TableHead>Inflow</TableHead>
                <TableHead>Outflow</TableHead>
                <TableHead>Closing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.accounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No cash or bank accounts yet.
                  </TableCell>
                </TableRow>
              )}
              {data.accounts.map((account) => (
                <TableRow key={account.cash_bank_account}>
                  <TableCell className="font-medium text-foreground">{account.name}</TableCell>
                  <TableCell>{CASH_BANK_KIND_LABELS[account.kind]}</TableCell>
                  <TableCell>{formatTZS(account.opening_balance)}</TableCell>
                  <TableCell>{formatTZS(account.inflow)}</TableCell>
                  <TableCell>{formatTZS(account.outflow)}</TableCell>
                  <TableCell>{formatTZS(account.closing_balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
