import { useQuery } from '@tanstack/react-query'

import {
  fetchCashFlowReport,
  fetchInstallmentReport,
  fetchLandInventoryReport,
  fetchLeadReport,
  fetchSalesReport,
} from '../api/reports-api'
import type {
  CashFlowReportParams,
  InstallmentReportParams,
  LandInventoryReportParams,
  LeadReportParams,
  SalesReportParams,
} from '../types'

export function useSalesReportQuery(params: SalesReportParams, enabled = true) {
  return useQuery({
    queryKey: ['reports', 'sales', params],
    queryFn: () => fetchSalesReport(params),
    enabled,
  })
}

export function useInstallmentReportQuery(params: InstallmentReportParams, enabled = true) {
  return useQuery({
    queryKey: ['reports', 'installments', params],
    queryFn: () => fetchInstallmentReport(params),
    enabled,
  })
}

export function useLeadReportQuery(params: LeadReportParams, enabled = true) {
  return useQuery({
    queryKey: ['reports', 'leads', params],
    queryFn: () => fetchLeadReport(params),
    enabled,
  })
}

export function useLandInventoryReportQuery(params: LandInventoryReportParams, enabled = true) {
  return useQuery({
    queryKey: ['reports', 'land-inventory', params],
    queryFn: () => fetchLandInventoryReport(params),
    enabled,
  })
}

export function useCashFlowReportQuery(params: CashFlowReportParams, enabled = true) {
  return useQuery({
    queryKey: ['reports', 'cash-flow', params],
    queryFn: () => fetchCashFlowReport(params),
    enabled,
  })
}
