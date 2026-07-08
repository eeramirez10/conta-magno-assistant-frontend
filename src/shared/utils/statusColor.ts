export function statusColor(status: string): 'success' | 'warning' | 'error' | 'info' | 'dark' {
  if (status === 'OPEN') return 'success'
  if (status === 'CLOSED') return 'error'
  if (status === 'COMPLETED') return 'info'
  if (status === 'PENDING_HUMAN') return 'warning'
  return 'dark'
}
