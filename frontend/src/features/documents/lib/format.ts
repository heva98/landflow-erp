const apiBaseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'
const mediaOrigin = apiBaseURL.replace(/\/api\/v1\/?$/, '')

export function resolveFileUrl(file: string): string {
  return file.startsWith('http') ? file : `${mediaOrigin}${file}`
}

export function formatFileSize(bytes: number | null): string {
  if (bytes === null) return '—'
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`
}
