import { Navigate, Route, Routes } from 'react-router-dom'

import { AppProviders } from '@/app/providers'
import { AppShell } from '@/components/layout/app-shell'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { AcquisitionCreatePage } from '@/features/acquisitions/pages/acquisition-create-page'
import { AcquisitionDetailPage } from '@/features/acquisitions/pages/acquisition-detail-page'
import { AcquisitionEditPage } from '@/features/acquisitions/pages/acquisition-edit-page'
import { AcquisitionsListPage } from '@/features/acquisitions/pages/acquisitions-list-page'
import { AgentDetailPage } from '@/features/agents/pages/agent-detail-page'
import { AgentsListPage } from '@/features/agents/pages/agents-list-page'
import { CommissionPaymentsPage } from '@/features/agents/pages/commission-payments-page'
import { CommissionSettingsPage } from '@/features/agents/pages/commission-settings-page'
import { RankingsPage } from '@/features/agents/pages/rankings-page'
import { LoginPage } from '@/features/auth/pages/login-page'
import { ManualPage } from '@/features/manual/pages/manual-page'
import { CustomerCreatePage } from '@/features/crm/pages/customer-create-page'
import { CustomerDetailPage } from '@/features/crm/pages/customer-detail-page'
import { CustomerEditPage } from '@/features/crm/pages/customer-edit-page'
import { CustomersListPage } from '@/features/crm/pages/customers-list-page'
import { LeadCreatePage } from '@/features/crm/pages/lead-create-page'
import { LeadDetailPage } from '@/features/crm/pages/lead-detail-page'
import { LeadEditPage } from '@/features/crm/pages/lead-edit-page'
import { LeadsPipelinePage } from '@/features/crm/pages/leads-pipeline-page'
import { DashboardPage } from '@/features/dashboard/pages/dashboard-page'
import { DocumentDetailPage } from '@/features/documents/pages/document-detail-page'
import { DocumentsListPage } from '@/features/documents/pages/documents-list-page'
import { GisPage } from '@/features/gis/pages/gis-page'
import { EmployeeCreatePage } from '@/features/hr/pages/employee-create-page'
import { EmployeeDetailPage } from '@/features/hr/pages/employee-detail-page'
import { EmployeeEditPage } from '@/features/hr/pages/employee-edit-page'
import { EmployeesListPage } from '@/features/hr/pages/employees-list-page'
import { HrSettingsPage } from '@/features/hr/pages/hr-settings-page'
import { LeaveRequestsPage } from '@/features/hr/pages/leave-requests-page'
import { PayrollPage } from '@/features/hr/pages/payroll-page'
import { InventoryPage } from '@/features/inventory/pages/inventory-page'
import { OwnershipTransferDetailPage } from '@/features/legal/pages/ownership-transfer-detail-page'
import { LegalPage } from '@/features/legal/pages/legal-page'
import { BookingDetailPage } from '@/features/site-visits/pages/booking-detail-page'
import { CheckInPage } from '@/features/site-visits/pages/check-in-page'
import { SiteVisitCreatePage } from '@/features/site-visits/pages/site-visit-create-page'
import { SiteVisitDetailPage } from '@/features/site-visits/pages/site-visit-detail-page'
import { SiteVisitsDirectoryPage } from '@/features/site-visits/pages/site-visits-directory-page'
import { SiteVisitsListPage } from '@/features/site-visits/pages/site-visits-list-page'
import { SubdivisionDetailPage } from '@/features/surveys/pages/subdivision-detail-page'
import { SurveyCreatePage } from '@/features/surveys/pages/survey-create-page'
import { SurveyDetailPage } from '@/features/surveys/pages/survey-detail-page'
import { SurveyDirectoryPage } from '@/features/surveys/pages/survey-directory-page'
import { SurveysListPage } from '@/features/surveys/pages/surveys-list-page'
import { AccountsPage } from '@/features/finance/pages/accounts-page'
import { FinanceReportsPage } from '@/features/finance/pages/finance-reports-page'
import { TransactionsPage } from '@/features/finance/pages/transactions-page'
import { PaymentPlanCreatePage } from '@/features/installments/pages/payment-plan-create-page'
import { PaymentPlanDetailPage } from '@/features/installments/pages/payment-plan-detail-page'
import { PaymentPlansListPage } from '@/features/installments/pages/payment-plans-list-page'
import { PlotCreatePage } from '@/features/plots/pages/plot-create-page'
import { PlotDetailPage } from '@/features/plots/pages/plot-detail-page'
import { PlotEditPage } from '@/features/plots/pages/plot-edit-page'
import { PlotsListPage } from '@/features/plots/pages/plots-list-page'
import { ProjectCreatePage } from '@/features/projects/pages/project-create-page'
import { ProjectDetailPage } from '@/features/projects/pages/project-detail-page'
import { ProjectEditPage } from '@/features/projects/pages/project-edit-page'
import { ProjectsListPage } from '@/features/projects/pages/projects-list-page'
import { ReportsPage } from '@/features/reports/pages/reports-page'
import { ReservationsListPage } from '@/features/reservations/pages/reservations-list-page'
import { SaleCreatePage } from '@/features/sales/pages/sale-create-page'
import { SaleDetailPage } from '@/features/sales/pages/sale-detail-page'
import { SalesListPage } from '@/features/sales/pages/sales-list-page'

function AppRoutes() {
  return (
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
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
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
