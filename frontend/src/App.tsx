import { Navigate, Route, Routes } from 'react-router-dom'

import { AppProviders } from '@/app/providers'
import { AppShell } from '@/components/layout/app-shell'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { LoginPage } from '@/features/auth/pages/login-page'
import { CustomerCreatePage } from '@/features/crm/pages/customer-create-page'
import { CustomerDetailPage } from '@/features/crm/pages/customer-detail-page'
import { CustomerEditPage } from '@/features/crm/pages/customer-edit-page'
import { CustomersListPage } from '@/features/crm/pages/customers-list-page'
import { LeadCreatePage } from '@/features/crm/pages/lead-create-page'
import { LeadDetailPage } from '@/features/crm/pages/lead-detail-page'
import { LeadEditPage } from '@/features/crm/pages/lead-edit-page'
import { LeadsPipelinePage } from '@/features/crm/pages/leads-pipeline-page'
import { DashboardPage } from '@/features/dashboard/pages/dashboard-page'
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
        <Route path="/crm/leads" element={<LeadsPipelinePage />} />
        <Route path="/crm/leads/new" element={<LeadCreatePage />} />
        <Route path="/crm/leads/:id" element={<LeadDetailPage />} />
        <Route path="/crm/leads/:id/edit" element={<LeadEditPage />} />
        <Route path="/crm/customers" element={<CustomersListPage />} />
        <Route path="/crm/customers/new" element={<CustomerCreatePage />} />
        <Route path="/crm/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/crm/customers/:id/edit" element={<CustomerEditPage />} />
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
