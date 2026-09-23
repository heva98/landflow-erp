import { RolesTab } from '@/features/accounts/components/roles-tab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { ActivityLogTab } from '../components/activity-log-tab'
import { ApprovalWorkflowsTab } from '../components/approval-workflows-tab'
import { AuditLogTab } from '../components/audit-log-tab'
import { CurrenciesTab } from '../components/currencies-tab'
import { LocationsTab } from '../components/locations-tab'
import { SettingsTab } from '../components/settings-tab'

export function AdministrationPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-foreground">System administration</h1>

      <Tabs defaultValue="audit-log">
        <TabsList>
          <TabsTrigger value="audit-log">Audit log</TabsTrigger>
          <TabsTrigger value="activity-log">Activity log</TabsTrigger>
          <TabsTrigger value="roles">Roles & permissions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="currencies">Currencies</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="approval-workflows">Approval workflows</TabsTrigger>
        </TabsList>
        <TabsContent value="audit-log">
          <AuditLogTab />
        </TabsContent>
        <TabsContent value="activity-log">
          <ActivityLogTab />
        </TabsContent>
        <TabsContent value="roles">
          <RolesTab />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
        <TabsContent value="currencies">
          <CurrenciesTab />
        </TabsContent>
        <TabsContent value="locations">
          <LocationsTab />
        </TabsContent>
        <TabsContent value="approval-workflows">
          <ApprovalWorkflowsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
