export function formatShortDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('es-MX', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}