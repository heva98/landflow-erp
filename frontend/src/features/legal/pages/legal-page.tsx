import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { ContractsTab } from '../components/contracts-tab'
import { DocumentTemplatesTab } from '../components/document-templates-tab'
import { OwnershipTransfersTab } from '../components/ownership-transfers-tab'
import { PowersOfAttorneyTab } from '../components/powers-of-attorney-tab'
import { SaleAgreementsTab } from '../components/sale-agreements-tab'
import { TitleDeedsTab } from '../components/title-deeds-tab'

export function LegalPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-foreground">Legal</h1>

      <Tabs defaultValue="ownership-transfers">
        <TabsList>
          <TabsTrigger value="ownership-transfers">Ownership Transfers</TabsTrigger>
          <TabsTrigger value="sale-agreements">Sale Agreements</TabsTrigger>
          <TabsTrigger value="title-deeds">Title Deeds</TabsTrigger>
          <TabsTrigger value="powers-of-attorney">Powers of Attorney</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="ownership-transfers">
          <OwnershipTransfersTab />
        </TabsContent>
        <TabsContent value="sale-agreements">
          <SaleAgreementsTab />
        </TabsContent>
        <TabsContent value="title-deeds">
          <TitleDeedsTab />
        </TabsContent>
        <TabsContent value="powers-of-attorney">
          <PowersOfAttorneyTab />
        </TabsContent>
        <TabsContent value="contracts">
          <ContractsTab />
        </TabsContent>
        <TabsContent value="templates">
          <DocumentTemplatesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
