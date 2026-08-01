import { apiClient } from '@/lib/api-client'

import type {
  Account,
  AccountInput,
  AccountListParams,
  CashBankAccount,
  CashBankAccountInput,
  CashBankAccountListParams,
  CashFlowReport,
  Expense,
  ExpenseInput,
  ExpenseListParams,
  Income,
  IncomeInput,
  IncomeListParams,
  PaginatedResponse,
  ProfitAndLossReport,
} from '../types'

export async function fetchAccounts(params: AccountListParams = {}): Promise<PaginatedResponse<Account>> {
  const response = await apiClient.get<PaginatedResponse<Account>>('/chart-of-accounts/', { params })
  return response.data
}

export async function createAccount(input: AccountInput): Promise<Account> {
  const response = await apiClient.post<Account>('/chart-of-accounts/', input)
  return response.data
}

export async function fetchCashBankAccounts(
  params: CashBankAccountListParams = {},
): Promise<PaginatedResponse<CashBankAccount>> {
  const response = await apiClient.get<PaginatedResponse<CashBankAccount>>('/cash-bank-accounts/', { params })
  return response.data
}

export async function createCashBankAccount(input: CashBankAccountInput): Promise<CashBankAccount> {
  const response = await apiClient.post<CashBankAccount>('/cash-bank-accounts/', input)
  return response.data
}

export async function fetchIncomeList(params: IncomeListParams = {}): Promise<PaginatedResponse<Income>> {
  const response = await apiClient.get<PaginatedResponse<Income>>('/income/', { params })
  return response.data
}

export async function createIncome(input: IncomeInput): Promise<Income> {
  const response = await apiClient.post<Income>('/income/', input)
  return response.data
}

export async function fetchExpenseList(params: ExpenseListParams = {}): Promise<PaginatedResponse<Expense>> {
  const response = await apiClient.get<PaginatedResponse<Expense>>('/expenses/', { params })
  return response.data
}

export async function createExpense(input: ExpenseInput): Promise<Expense> {
  const response = await apiClient.post<Expense>('/expenses/', input)
  return response.data
}

export async function fetchProfitAndLoss(dateFrom: string, dateTo: string): Promise<ProfitAndLossReport> {
  const response = await apiClient.get<ProfitAndLossReport>('/finance-reports/profit-and-loss/', {
    params: { date_from: dateFrom, date_to: dateTo },
  })
  return response.data
}

export async function fetchCashFlow(dateFrom: string, dateTo: string): Promise<CashFlowReport> {
  const response = await apiClient.get<CashFlowReport>('/finance-reports/cash-flow/', {
    params: { date_from: dateFrom, date_to: dateTo },
  })
  return response.data
}
