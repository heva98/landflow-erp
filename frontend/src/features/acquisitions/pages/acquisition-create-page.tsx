import { useNavigate } from 'react-router-dom'

import { AcquisitionForm } from '../components/acquisition-form'
import { useCreateAcquisitionMutation } from '../hooks/use-acquisitions'

export function AcquisitionCreatePage() {
  const navigate = useNavigate()
  const createAcquisition = useCreateAcquisitionMutation()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-foreground">New land acquisition</h1>
      <AcquisitionForm
        submitLabel="Create acquisition"
        onSubmit={async (input) => {
          const acquisition = await createAcquisition.mutateAsync(input)
          navigate(`/acquisitions/${acquisition.id}`)
        }}
      />
    </div>
  )
}
