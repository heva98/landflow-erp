import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createAccount,
  createCashBankAccount,
  createExpense,
  createIncome,
  fetchAccounts,
  fetchCashBankAccounts,
  fetchCashFlow,
  fetchExpenseList,
  fetchIncomeList,
  fetchProfitAndLoss,
} from '../api/finance-api'
import type { AccountListParams, CashBankAccountListParams, ExpenseListParams, IncomeListParams } from '../types'

export function useAccountsQuery(params: AccountListParams = {}) {
  return useQuery({
    queryKey: ['finance', 'accounts', params],
    queryFn: () => fetchAccounts(params),
  })
}

export function useCreateAccountMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'accounts'] })
    },
  })
}

export function useCashBankAccountsQuery(params: CashBankAccountListParams = {}) {
  return useQuery({
    queryKey: ['finance', 'cash-bank-accounts', params],
    queryFn: () => fetchCashBankAccounts(params),
  })
}

export function useCreateCashBankAccountMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCashBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'cash-bank-accounts'] })
    },
  })
}

export function useIncomeListQuery(params: IncomeListParams = {}) {
  return useQuery({
    queryKey: ['finance', 'income', params],
    queryFn: () => fetchIncomeList(params),
  })
}

export function useCreateIncomeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'income'] })
      queryClient.invalidateQueries({ queryKey: ['finance', 'cash-bank-accounts'] })
    },
  })
}

export function useExpenseListQuery(params: ExpenseListParams = {}) {
  return useQuery({
    queryKey: ['finance', 'expenses', params],
    queryFn: () => fetchExpenseList(params),
  })
}

export function useCreateExpenseMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] })
      queryClient.invalidateQueries({ queryKey: ['finance', 'cash-bank-accounts'] })
    },
  })
}

export function useProfitAndLossQuery(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ['finance', 'reports', 'profit-and-loss', dateFrom, dateTo],
    queryFn: () => fetchProfitAndLoss(dateFrom, dateTo),
  })
}

export function useCashFlowQuery(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ['finance', 'reports', 'cash-flow', dateFrom, dateTo],
    queryFn: () => fetchCashFlow(dateFrom, dateTo),
  })
}
