export const ACCOUNT_TYPES = ['asset', 'liability', 'equity', 'income', 'expense'] as const
export type AccountType = (typeof ACCOUNT_TYPES)[number]

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  asset: 'Asset',
  liability: 'Liability',
  equity: 'Equity',
  income: 'Income',
  expense: 'Expense',
}

export const CASH_BANK_KINDS = ['bank', 'cash', 'petty_cash'] as const
export type CashBankKind = (typeof CASH_BANK_KINDS)[number]

export const CASH_BANK_KIND_LABELS: Record<CashBankKind, string> = {
  bank: 'Bank',
  cash: 'Cash',
  petty_cash: 'Petty Cash',
}

export const INCOME_SOURCES = ['sale', 'installment', 'other'] as const
export type IncomeSource = (typeof INCOME_SOURCES)[number]

export const INCOME_SOURCE_LABELS: Record<IncomeSource, string> = {
  sale: 'Sale Receipt',
  installment: 'Installment Payment',
  other: 'Other',
}

export interface Account {
  id: string
  code: string
  name: string
  type: AccountType
  parent: string | null
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AccountInput {
  code: string
  name: string
  type: AccountType
  parent?: string | null
  description?: string
  is_active?: boolean
}

export interface CashBankAccount {
  id: string
  name: string
  kind: CashBankKind
  account: string
  account_code: string
  bank_name: string
  branch: string
  account_number: string
  currency: string
  opening_balance: string
  balance: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CashBankAccountInput {
  name: string
  kind: CashBankKind
  account: string
  bank_name?: string
  branch?: string
  account_number?: string
  currency?: string
  opening_balance?: number
}

export interface Income {
  id: string
  income_number: string
  account: string
  account_name: string
  deposit_to: string
  deposit_to_name: string
  amount: string
  date: string
  source: IncomeSource
  description: string
  recorded_by: string | null
  recorded_by_name: string | null
  journal_entry: string | null
  journal_entry_number: string | null
  created_at: string
}

export interface IncomeInput {
  account: string
  deposit_to: string
  amount: number
  date?: string
  description?: string
}

export interface Expense {
  id: string
  expense_number: string
  account: string
  account_name: string
  paid_from: string
  paid_from_name: string
  amount: string
  date: string
  payee: string
  description: string
  recorded_by: string | null
  recorded_by_name: string | null
  journal_entry: string | null
  journal_entry_number: string | null
  created_at: string
}

export interface ExpenseInput {
  account: string
  paid_from: string
  amount: number
  date?: string
  payee?: string
  description?: string
}

export interface ProfitAndLossLine {
  account: string
  code: string
  name: string
  amount: string
}

export interface ProfitAndLossReport {
  date_from: string
  date_to: string
  income: ProfitAndLossLine[]
  total_income: string
  expenses: ProfitAndLossLine[]
  total_expense: string
  net_profit: string
}

export interface CashFlowAccountRow {
  cash_bank_account: string
  name: string
  kind: CashBankKind
  opening_balance: string
  inflow: string
  outflow: string
  closing_balance: string
}

export interface CashFlowReport {
  date_from: string
  date_to: string
  accounts: CashFlowAccountRow[]
  total_inflow: string
  total_outflow: string
  net_cash_flow: string
}

export interface AccountListParams {
  type?: AccountType
  is_active?: boolean
}

export interface CashBankAccountListParams {
  kind?: CashBankKind
  is_active?: boolean
}

export interface IncomeListParams {
  account?: string
  source?: IncomeSource
  date_from?: string
  date_to?: string
  page?: number
}

export interface ExpenseListParams {
  account?: string
  date_from?: string
  date_to?: string
  page?: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
