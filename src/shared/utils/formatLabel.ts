
const LABELS: Record<string, string> = {
  // Etapas
  GREETING: 'Bienvenida',
  QUALIFYING: 'Calificación',
  INFORMATION: 'Recopilando información',
  PLAN_RECOMMENDATION: 'Plan recomendado',
  SCHEDULING: 'Programación',
  PENDING_HUMAN: 'Atención humana',
  COMPLETED: 'Completada',

  // Estados
  OPEN: 'Abierta',
  CLOSED: 'Cerrada',
  ARCHIVED: 'Archivada',

  // Proveedores
  META: 'WhatsApp',
  TWILIO: 'Twilio',

}



export function formatLabel(value: string): string {
  return LABELS[value] ?? value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}
