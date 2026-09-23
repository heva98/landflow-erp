import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { AppProviders } from '@/app/providers'
import { AppShell } from '@/components/layout/app-shell'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { RouteLoader } from '@/components/layout/route-loader'
import { LoginPage } from '@/features/auth/pages/login-page'

const AcquisitionCreatePage = lazy(() =>
  import('@/features/acquisitions/pages/acquisition-create-page').then((m) => ({ default: m.AcquisitionCreatePage })),
)
const AcquisitionDetailPage = lazy(() =>
  import('@/features/acquisitions/pages/acquisition-detail-page').then((m) => ({ default: m.AcquisitionDetailPage })),
)
const AcquisitionEditPage = lazy(() =>
  import('@/features/acquisitions/pages/acquisition-edit-page').then((m) => ({ default: m.AcquisitionEditPage })),
)
const AcquisitionsListPage = lazy(() =>
  import('@/features/acquisitions/pages/acquisitions-list-page').then((m) => ({ default: m.AcquisitionsListPage })),
)
const AgentDetailPage = lazy(() =>
  import('@/features/agents/pages/agent-detail-page').then((m) => ({ default: m.AgentDetailPage })),
)
const AgentsListPage = lazy(() =>
  import('@/features/agents/pages/agents-list-page').then((m) => ({ default: m.AgentsListPage })),
)
const CommissionPaymentsPage = lazy(() =>
  import('@/features/agents/pages/commission-payments-page').then((m) => ({ default: m.CommissionPaymentsPage })),
)
const CommissionSettingsPage = lazy(() =>
  import('@/features/agents/pages/commission-settings-page').then((m) => ({ default: m.CommissionSettingsPage })),
)
const RankingsPage = lazy(() =>
  import('@/features/agents/pages/rankings-page').then((m) => ({ default: m.RankingsPage })),
)
const AdministrationPage = lazy(() =>
  import('@/features/administration/pages/administration-page').then((m) => ({ default: m.AdministrationPage })),
)
const UsersListPage = lazy(() =>
  import('@/features/accounts/pages/users-list-page').then((m) => ({ default: m.UsersListPage })),
)
const ManualPage = lazy(() => import('@/features/manual/pages/manual-page').then((m) => ({ default: m.ManualPage })))
const CustomerCreatePage = lazy(() =>
  import('@/features/crm/pages/customer-create-page').then((m) => ({ default: m.CustomerCreatePage })),
)
const CustomerDetailPage = lazy(() =>
  import('@/features/crm/pages/customer-detail-page').then((m) => ({ default: m.CustomerDetailPage })),
)
const CustomerEditPage = lazy(() =>
  import('@/features/crm/pages/customer-edit-page').then((m) => ({ default: m.CustomerEditPage })),
)
const CustomersListPage = lazy(() =>
  import('@/features/crm/pages/customers-list-page').then((m) => ({ default: m.CustomersListPage })),
)
const LeadCreatePage = lazy(() =>
  import('@/features/crm/pages/lead-create-page').then((m) => ({ default: m.LeadCreatePage })),
)
const LeadDetailPage = lazy(() =>
  import('@/features/crm/pages/lead-detail-page').then((m) => ({ default: m.LeadDetailPage })),
)
const LeadEditPage = lazy(() =>
  import('@/features/crm/pages/lead-edit-page').then((m) => ({ default: m.LeadEditPage })),
)
const LeadsPipelinePage = lazy(() =>
  import('@/features/crm/pages/leads-pipeline-page').then((m) => ({ default: m.LeadsPipelinePage })),
)
const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/dashboard-page').then((m) => ({ default: m.DashboardPage })),
)
const DocumentDetailPage = lazy(() =>
  import('@/features/documents/pages/document-detail-page').then((m) => ({ default: m.DocumentDetailPage })),
)
const DocumentsListPage = lazy(() =>
  import('@/features/documents/pages/documents-list-page').then((m) => ({ default: m.DocumentsListPage })),
)
const GisPage = lazy(() => import('@/features/gis/pages/gis-page').then((m) => ({ default: m.GisPage })))
const EmployeeCreatePage = lazy(() =>
  import('@/features/hr/pages/employee-create-page').then((m) => ({ default: m.EmployeeCreatePage })),
)
const EmployeeDetailPage = lazy(() =>
  import('@/features/hr/pages/employee-detail-page').then((m) => ({ default: m.EmployeeDetailPage })),
)
const EmployeeEditPage = lazy(() =>
  import('@/features/hr/pages/employee-edit-page').then((m) => ({ default: m.EmployeeEditPage })),
)
const EmployeesListPage = lazy(() =>
  import('@/features/hr/pages/employees-list-page').then((m) => ({ default: m.EmployeesListPage })),
)
const HrSettingsPage = lazy(() =>
  import('@/features/hr/pages/hr-settings-page').then((m) => ({ default: m.HrSettingsPage })),
)
const LeaveRequestsPage = lazy(() =>
  import('@/features/hr/pages/leave-requests-page').then((m) => ({ default: m.LeaveRequestsPage })),
)
const PayrollPage = lazy(() => import('@/features/hr/pages/payroll-page').then((m) => ({ default: m.PayrollPage })))
const InventoryPage = lazy(() =>
  import('@/features/inventory/pages/inventory-page').then((m) => ({ default: m.InventoryPage })),
)
const OwnershipTransferDetailPage = lazy(() =>
  import('@/features/legal/pages/ownership-transfer-detail-page').then((m) => ({
    default: m.OwnershipTransferDetailPage,
  })),
)
const LegalPage = lazy(() => import('@/features/legal/pages/legal-page').then((m) => ({ default: m.LegalPage })))
const BookingDetailPage = lazy(() =>
  import('@/features/site-visits/pages/booking-detail-page').then((m) => ({ default: m.BookingDetailPage })),
)
const CheckInPage = lazy(() =>
  import('@/features/site-visits/pages/check-in-page').then((m) => ({ default: m.CheckInPage })),
)
const SiteVisitCreatePage = lazy(() =>
  import('@/features/site-visits/pages/site-visit-create-page').then((m) => ({ default: m.SiteVisitCreatePage })),
)
const SiteVisitDetailPage = lazy(() =>
  import('@/features/site-visits/pages/site-visit-detail-page').then((m) => ({ default: m.SiteVisitDetailPage })),
)
const SiteVisitsDirectoryPage = lazy(() =>
  import('@/features/site-visits/pages/site-visits-directory-page').then((m) => ({
    default: m.SiteVisitsDirectoryPage,
  })),
)
const SiteVisitsListPage = lazy(() =>
  import('@/features/site-visits/pages/site-visits-list-page').then((m) => ({ default: m.SiteVisitsListPage })),
)
const SubdivisionDetailPage = lazy(() =>
  import('@/features/surveys/pages/subdivision-detail-page').then((m) => ({ default: m.SubdivisionDetailPage })),
)
const SurveyCreatePage = lazy(() =>
  import('@/features/surveys/pages/survey-create-page').then((m) => ({ default: m.SurveyCreatePage })),
)
const SurveyDetailPage = lazy(() =>
  import('@/features/surveys/pages/survey-detail-page').then((m) => ({ default: m.SurveyDetailPage })),
)
const SurveyDirectoryPage = lazy(() =>
  import('@/features/surveys/pages/survey-directory-page').then((m) => ({ default: m.SurveyDirectoryPage })),
)
const SurveysListPage = lazy(() =>
  import('@/features/surveys/pages/surveys-list-page').then((m) => ({ default: m.SurveysListPage })),
)
const AccountsPage = lazy(() =>
  import('@/features/finance/pages/accounts-page').then((m) => ({ default: m.AccountsPage })),
)
const FinanceReportsPage = lazy(() =>
  import('@/features/finance/pages/finance-reports-page').then((m) => ({ default: m.FinanceReportsPage })),
)
const TransactionsPage = lazy(() =>
  import('@/features/finance/pages/transactions-page').then((m) => ({ default: m.TransactionsPage })),
)
const PaymentPlanCreatePage = lazy(() =>
  import('@/features/installments/pages/payment-plan-create-page').then((m) => ({
    default: m.PaymentPlanCreatePage,
  })),
)
const PaymentPlanDetailPage = lazy(() =>
  import('@/features/installments/pages/payment-plan-detail-page').then((m) => ({
    default: m.PaymentPlanDetailPage,
  })),
)
const PaymentPlansListPage = lazy(() =>
  import('@/features/installments/pages/payment-plans-list-page').then((m) => ({ default: m.PaymentPlansListPage })),
)
const PlotCreatePage = lazy(() =>
  import('@/features/plots/pages/plot-create-page').then((m) => ({ default: m.PlotCreatePage })),
)
const PlotDetailPage = lazy(() =>
  import('@/features/plots/pages/plot-detail-page').then((m) => ({ default: m.PlotDetailPage })),
)
const PlotEditPage = lazy(() =>
  import('@/features/plots/pages/plot-edit-page').then((m) => ({ default: m.PlotEditPage })),
)
const PlotsListPage = lazy(() =>
  import('@/features/plots/pages/plots-list-page').then((m) => ({ default: m.PlotsListPage })),
)
const ProjectCreatePage = lazy(() =>
  import('@/features/projects/pages/project-create-page').then((m) => ({ default: m.ProjectCreatePage })),
)
const ProjectDetailPage = lazy(() =>
  import('@/features/projects/pages/project-detail-page').then((m) => ({ default: m.ProjectDetailPage })),
)
const ProjectEditPage = lazy(() =>
  import('@/features/projects/pages/project-edit-page').then((m) => ({ default: m.ProjectEditPage })),
)
const ProjectsListPage = lazy(() =>
  import('@/features/projects/pages/projects-list-page').then((m) => ({ default: m.ProjectsListPage })),
)
const ReportsPage = lazy(() =>
  import('@/features/reports/pages/reports-page').then((m) => ({ default: m.ReportsPage })),
)
const ReservationsListPage = lazy(() =>
  import('@/features/reservations/pages/reservations-list-page').then((m) => ({ default: m.ReservationsListPage })),
)
const SaleCreatePage = lazy(() =>
  import('@/features/sales/pages/sale-create-page').then((m) => ({ default: m.SaleCreatePage })),
)
const SaleDetailPage = lazy(() =>
  import('@/features/sales/pages/sale-detail-page').then((m) => ({ default: m.SaleDetailPage })),
)
const SalesListPage = lazy(() =>
  import('@/features/sales/pages/sales-list-page').then((m) => ({ default: m.SalesListPage })),
)

function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/manual" element={<ManualPage />} />
          <Route path="/acquisitions" element={<AcquisitionsListPage />} />
          <Route path="/acquisitions/new" element={<AcquisitionCreatePage />} />
          <Route path="/acquisitions/:id" element={<AcquisitionDetailPage />} />
          <Route path="/acquisitions/:id/edit" element={<AcquisitionEditPage />} />
          <Route path="/projects" element={<ProjectsListPage />} />
          <Route path="/projects/new" element={<ProjectCreatePage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/projects/:id/edit" element={<ProjectEditPage />} />
          <Route path="/plots" element={<PlotsListPage />} />
          <Route path="/plots/new" element={<PlotCreatePage />} />
          <Route path="/plots/:id" element={<PlotDetailPage />} />
          <Route path="/plots/:id/edit" element={<PlotEditPage />} />
          <Route path="/reservations" element={<ReservationsListPage />} />
          <Route path="/sales" element={<SalesListPage />} />
          <Route path="/sales/new" element={<SaleCreatePage />} />
          <Route path="/sales/:id" element={<SaleDetailPage />} />
          <Route path="/installments" element={<PaymentPlansListPage />} />
          <Route path="/installments/new" element={<PaymentPlanCreatePage />} />
          <Route path="/installments/:id" element={<PaymentPlanDetailPage />} />
          <Route path="/finance/accounts" element={<AccountsPage />} />
          <Route path="/finance/transactions" element={<TransactionsPage />} />
          <Route path="/finance/reports" element={<FinanceReportsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/documents" element={<DocumentsListPage />} />
          <Route path="/documents/:id" element={<DocumentDetailPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/legal/ownership-transfers/:id" element={<OwnershipTransferDetailPage />} />
          <Route path="/surveys" element={<SurveysListPage />} />
          <Route path="/surveys/new" element={<SurveyCreatePage />} />
          <Route path="/surveys/directory" element={<SurveyDirectoryPage />} />
          <Route path="/surveys/:id" element={<SurveyDetailPage />} />
          <Route path="/surveys/:id/subdivision" element={<SubdivisionDetailPage />} />
          <Route path="/gis" element={<GisPage />} />
          <Route path="/site-visits" element={<SiteVisitsListPage />} />
          <Route path="/site-visits/new" element={<SiteVisitCreatePage />} />
          <Route path="/site-visits/directory" element={<SiteVisitsDirectoryPage />} />
          <Route path="/site-visits/check-in" element={<CheckInPage />} />
          <Route path="/site-visits/bookings/:id" element={<BookingDetailPage />} />
          <Route path="/site-visits/:id" element={<SiteVisitDetailPage />} />
          <Route path="/crm/leads" element={<LeadsPipelinePage />} />
          <Route path="/crm/leads/new" element={<LeadCreatePage />} />
          <Route path="/crm/leads/:id" element={<LeadDetailPage />} />
          <Route path="/crm/leads/:id/edit" element={<LeadEditPage />} />
          <Route path="/crm/customers" element={<CustomersListPage />} />
          <Route path="/crm/customers/new" element={<CustomerCreatePage />} />
          <Route path="/crm/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/crm/customers/:id/edit" element={<CustomerEditPage />} />
          <Route path="/hr/employees" element={<EmployeesListPage />} />
          <Route path="/hr/employees/new" element={<EmployeeCreatePage />} />
          <Route path="/hr/employees/:id" element={<EmployeeDetailPage />} />
          <Route path="/hr/employees/:id/edit" element={<EmployeeEditPage />} />
          <Route path="/hr/departments" element={<HrSettingsPage />} />
          <Route path="/hr/leave-requests" element={<LeaveRequestsPage />} />
          <Route path="/hr/payroll" element={<PayrollPage />} />
          <Route path="/agents" element={<AgentsListPage />} />
          <Route path="/agents/settings" element={<CommissionSettingsPage />} />
          <Route path="/agents/rankings" element={<RankingsPage />} />
          <Route path="/agents/commission-payments" element={<CommissionPaymentsPage />} />
          <Route path="/agents/:id" element={<AgentDetailPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/users" element={<UsersListPage />} />
          <Route path="/administration" element={<AdministrationPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  )
}

export default App
