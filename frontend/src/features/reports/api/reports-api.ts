import { apiClient } from '@/lib/api-client'

import type {
  CashFlowReportParams,
  ExportFormat,
  InstallmentReport,
  InstallmentReportParams,
  LandInventoryReport,
  LandInventoryReportParams,
  LeadReport,
  LeadReportParams,
  ReportsCashFlowReport,
  SalesReport,
  SalesReportParams,
} from '../types'

export async function fetchSalesReport(params: SalesReportParams = {}): Promise<SalesReport> {
  const response = await apiClient.get<SalesReport>('/reports/sales/', { params })
  return response.data
}

export async function fetchInstallmentReport(params: InstallmentReportParams = {}): Promise<InstallmentReport> {
  const response = await apiClient.get<InstallmentReport>('/reports/installments/', { params })
  return response.data
}

export async function fetchLeadReport(params: LeadReportParams = {}): Promise<LeadReport> {
  const response = await apiClient.get<LeadReport>('/reports/leads/', { params })
  return response.data
}

export async function fetchLandInventoryReport(params: LandInventoryReportParams = {}): Promise<LandInventoryReport> {
  const response = await apiClient.get<LandInventoryReport>('/reports/land-inventory/', { params })
  return response.data
}

export async function fetchCashFlowReport(params: CashFlowReportParams): Promise<ReportsCashFlowReport> {
  const response = await apiClient.get<ReportsCashFlowReport>('/reports/cash-flow/', { params })
  return response.data
}

const REPORT_PATHS = {
  sales: '/reports/sales/',
  installments: '/reports/installments/',
  leads: '/reports/leads/',
  'land-inventory': '/reports/land-inventory/',
  'cash-flow': '/reports/cash-flow/',
} as const

export async function downloadReportExport(
  report: keyof typeof REPORT_PATHS,
  params: Record<string, string | undefined>,
  format: ExportFormat,
): Promise<void> {
  const response = await apiClient.get(REPORT_PATHS[report], {
    params: { ...params, export: format },
    responseType: 'blob',
  })

  const disposition = response.headers['content-disposition'] as string | undefined
  const match = disposition?.match(/filename="([^"]+)"/)
  const filename = match?.[1] ?? `${report}-report.${format}`

  const url = window.URL.createObjectURL(response.data as Blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
