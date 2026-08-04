import { useNavigate, useParams } from 'react-router-dom'

import { AcquisitionForm } from '../components/acquisition-form'
import { useAcquisitionQuery, useUpdateAcquisitionMutation } from '../hooks/use-acquisitions'

export function AcquisitionEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: acquisition, isLoading } = useAcquisitionQuery(id)
  const updateAcquisition = useUpdateAcquisitionMutation(id as string)

  if (isLoading || !acquisition) {
    return <p className="text-muted-foreground">Loading acquisition…</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-foreground">Edit {acquisition.name}</h1>
      <AcquisitionForm
        submitLabel="Save changes"
        defaultValues={{
          name: acquisition.name,
          location: acquisition.location,
          region: acquisition.region,
          district: acquisition.district,
          latitude: acquisition.latitude ? Number(acquisition.latitude) : undefined,
          longitude: acquisition.longitude ? Number(acquisition.longitude) : undefined,
          area_sqm: Number(acquisition.area_sqm),
          description: acquisition.description,
          ownership_verified: acquisition.ownership_verified,
          legal_checks_passed: acquisition.legal_checks_passed,
          due_diligence_notes: acquisition.due_diligence_notes,
          valuation_amount: Number(acquisition.valuation_amount),
          valuation_date: acquisition.valuation_date ?? '',
          valuator_name: acquisition.valuator_name,
          asking_price: Number(acquisition.asking_price),
          purchase_price: Number(acquisition.purchase_price),
          notes: acquisition.notes,
        }}
        onSubmit={async (input) => {
          await updateAcquisition.mutateAsync(input)
          navigate(`/acquisitions/${acquisition.id}`)
        }}
      />
    </div>
  )
}
