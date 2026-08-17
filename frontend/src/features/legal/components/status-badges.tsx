import { Badge } from '@/components/ui/badge'

import {
  CONTRACT_STATUS_LABELS,
  POA_STATUS_LABELS,
  SALE_AGREEMENT_STATUS_LABELS,
  TITLE_DEED_STATUS_LABELS,
  TRANSFER_STATUS_LABELS,
  type ContractStatus,
  type PoaStatus,
  type SaleAgreementStatus,
  type TitleDeedStatus,
  type TransferStatus,
} from '../types'

type Variant = 'secondary' | 'info' | 'warning' | 'success' | 'destructive'

const agreementVariant: Record<SaleAgreementStatus, Variant> = {
  draft: 'secondary',
  sent_for_signature: 'info',
  signed: 'warning',
  approved: 'success',
  void: 'destructive',
}
export function SaleAgreementStatusBadge({ status }: { status: SaleAgreementStatus }) {
  return <Badge variant={agreementVariant[status]}>{SALE_AGREEMENT_STATUS_LABELS[status]}</Badge>
}

const deedVariant: Record<TitleDeedStatus, Variant> = {
  pending: 'secondary',
  applied: 'info',
  issued: 'warning',
  approved: 'success',
}
export function TitleDeedStatusBadge({ status }: { status: TitleDeedStatus }) {
  return <Badge variant={deedVariant[status]}>{TITLE_DEED_STATUS_LABELS[status]}</Badge>
}

const poaVariant: Record<PoaStatus, Variant> = {
  pending: 'secondary',
  active: 'success',
  expired: 'warning',
  revoked: 'destructive',
}
export function PoaStatusBadge({ status }: { status: PoaStatus }) {
  return <Badge variant={poaVariant[status]}>{POA_STATUS_LABELS[status]}</Badge>
}

const contractVariant: Record<ContractStatus, Variant> = {
  draft: 'secondary',
  active: 'success',
  expired: 'warning',
  terminated: 'destructive',
}
export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  return <Badge variant={contractVariant[status]}>{CONTRACT_STATUS_LABELS[status]}</Badge>
}

const transferVariant: Record<TransferStatus, Variant> = {
  pending: 'secondary',
  approved: 'info',
  completed: 'success',
  rejected: 'destructive',
}
export function TransferStatusBadge({ status }: { status: TransferStatus }) {
  return <Badge variant={transferVariant[status]}>{TRANSFER_STATUS_LABELS[status]}</Badge>
}
