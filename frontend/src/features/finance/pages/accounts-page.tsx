import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { formatTZS } from '@/lib/utils'

import { AccountFormDialog } from '../components/account-form-dialog'
import { CashBankAccountFormDialog } from '../components/cash-bank-account-form-dialog'
import { useAccountsQuery, useCashBankAccountsQuery } from '../hooks/use-finance'
import { canManageAccounts, canManageCashBankAccounts } from '../lib/permissions'
import { ACCOUNT_TYPE_LABELS, CASH_BANK_KIND_LABELS } from '../types'

export function AccountsPage() {
  const { user } = useAuth()
  const canCreateAccount = canManageAccounts(user?.permissions)
  const canCreateCashBankAccount = canManageCashBankAccounts(user?.permissions)

  const { data: accounts, isLoading: accountsLoading } = useAccountsQuery()
  const { data: cashBankAccounts, isLoading: cashBankLoading } = useCashBankAccountsQuery()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-foreground">Accounts</h1>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-foreground">Cash & bank accounts</h2>
          {canCreateCashBankAccount && <CashBankAccountFormDialog />}
        </div>
        <div className="rounded-xl bg-card ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Account #</TableHead>
                <TableHead>Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashBankLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              )}
              {cashBankAccounts && cashBankAccounts.results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No cash or bank accounts yet.
                  </TableCell>
                </TableRow>
              )}
              {cashBankAccounts?.results.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium text-foreground">{account.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{CASH_BANK_KIND_LABELS[account.kind]}</Badge>
                  </TableCell>
                  <TableCell>{account.bank_name || '—'}</TableCell>
                  <TableCell>{account.account_number || '—'}</TableCell>
                  <TableCell>{formatTZS(account.balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-foreground">Chart of accounts</h2>
          {canCreateAccount && <AccountFormDialog />}
        </div>
        <div className="rounded-xl bg-card ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountsLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              )}
              {accounts && accounts.results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No accounts yet.
                  </TableCell>
                </TableRow>
              )}
              {accounts?.results.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium text-foreground">{account.code}</TableCell>
                  <TableCell>{account.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{ACCOUNT_TYPE_LABELS[account.type]}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{account.description || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
