import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { cn, formatTZS } from '@/lib/utils'

import { ExpenseFormDialog } from '../components/expense-form-dialog'
import { IncomeFormDialog } from '../components/income-form-dialog'
import { useExpenseListQuery, useIncomeListQuery } from '../hooks/use-finance'
import { canRecordExpense, canRecordIncome } from '../lib/permissions'
import { INCOME_SOURCE_LABELS } from '../types'

type TransactionType = 'income' | 'expenses'

export function TransactionsPage() {
  const [type, setType] = useState<TransactionType>('income')
  const { user } = useAuth()
  const canCreateIncome = canRecordIncome(user?.permissions)
  const canCreateExpense = canRecordExpense(user?.permissions)

  const incomeQuery = useIncomeListQuery()
  const expenseQuery = useExpenseListQuery()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Transactions</h1>
        {type === 'income' ? canCreateIncome && <IncomeFormDialog /> : canCreateExpense && <ExpenseFormDialog />}
      </div>

      <div className="flex w-fit rounded-lg bg-card p-1 ring-1 ring-foreground/10">
        {(['income', 'expenses'] as const).map((value) => (
          <Button
            key={value}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setType(value)}
            className={cn(
              'rounded-md',
              type === value ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground' : '',
            )}
          >
            {value === 'income' ? 'Income' : 'Expenses'}
          </Button>
        ))}
      </div>

      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        {type === 'income' ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Income #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Deposited to</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomeQuery.isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              )}
              {incomeQuery.data && incomeQuery.data.results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No income recorded yet.
                  </TableCell>
                </TableRow>
              )}
              {incomeQuery.data?.results.map((income) => (
                <TableRow key={income.id}>
                  <TableCell className="font-medium text-foreground">{income.income_number}</TableCell>
                  <TableCell>{new Date(income.date).toLocaleDateString()}</TableCell>
                  <TableCell>{income.account_name}</TableCell>
                  <TableCell>{income.deposit_to_name}</TableCell>
                  <TableCell>{formatTZS(income.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={income.source === 'other' ? 'secondary' : 'success'}>
                      {INCOME_SOURCE_LABELS[income.source]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{income.description || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expense #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Paid from</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payee</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenseQuery.isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              )}
              {expenseQuery.data && expenseQuery.data.results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No expenses recorded yet.
                  </TableCell>
                </TableRow>
              )}
              {expenseQuery.data?.results.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium text-foreground">{expense.expense_number}</TableCell>
                  <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                  <TableCell>{expense.account_name}</TableCell>
                  <TableCell>{expense.paid_from_name}</TableCell>
                  <TableCell>{formatTZS(expense.amount)}</TableCell>
                  <TableCell>{expense.payee || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{expense.description || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
