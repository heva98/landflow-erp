export function canAddDocuments(permissions: string[] | undefined): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes('documents.add_document')
}

export function canDeleteDocuments(permissions: string[] | undefined): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes('documents.delete_document')
}
