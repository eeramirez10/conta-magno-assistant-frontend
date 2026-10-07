import { useEffect, useState, type FormEvent } from 'react'
import {
  getIncomingNotificationSettings,
  saveIncomingNotificationSettings,
  testIncomingNotificationSettings,
  type NotificationTestResult,
} from '../features/settings/api/incomingNotifications'
import Button from '../shared/ui/button/Button'

const formatNumbers = (recipients: string[]) => recipients.map((number) => '+' + number).join('\n')

export function SettingsPage() {
  const [numbers, setNumbers] = useState<string | null>(null)
  const [savedNumbers, setSavedNumbers] = useState('')
  const [metaConfigured, setMetaConfigured] = useState(false)
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState<'save' | 'test' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<NotificationTestResult[]>([])
  const [loadVersion, setLoadVersion] = useState(0)

  useEffect(() => {
    let active = true
    getIncomingNotificationSettings()
      .then((response) => {
        if (!active) return
        const text = formatNumbers(response.data.recipients)
        setNumbers(text)
        setSavedNumbers(text)
        setMetaConfigured(response.metaConfigured)
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'No se pudieron cargar los números')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [loadVersion])

  const dirty = numbers !== null && numbers !== savedNumbers
  const busy = action !== null

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (numbers === null || busy) return
    setAction('save')
    setError(null)
    setNotice(null)
    setTestResults([])
    try {
      const response = await saveIncomingNotificationSettings({
        recipients: numbers.split(/[\n,;]+/).map((number) => number.trim()).filter(Boolean),
      })
      const text = formatNumbers(response.data.recipients)
      setNumbers(text)
      setSavedNumbers(text)
      setMetaConfigured(response.metaConfigured)
      setNotice(response.data.recipients.length ? 'Números guardados. Recibirán los avisos de nuevos mensajes.' : 'Números eliminados. Los avisos están desactivados.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron guardar los números')
    } finally {
      setAction(null)
    }
  }

  async function sendTest() {
    if (busy || dirty || !metaConfigured || !savedNumbers.trim()) return
    setAction('test')
    setError(null)
    setNotice(null)
    setTestResults([])
    try {
      const response = await testIncomingNotificationSettings()
      setTestResults(response.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la prueba')
    } finally {
      setAction(null)
    }
  }

  return (
    <section className="min-w-0 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Configuración</p>
      <h1 className="mt-3 text-2xl font-semibold text-slate-950">Notificaciones por WhatsApp</h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">Añade los números de tu equipo que recibirán el aviso con la plantilla aprobada. Se envía un solo aviso por contacto y ciclo; al calificar el lead, se habilita el siguiente.</p>
      {loading && <p role="status" className="mt-6 text-sm text-slate-500">Cargando números…</p>}
      {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {!loading && numbers === null && <Button className="mt-4" variant="outline" onClick={() => { setLoading(true); setError(null); setLoadVersion((value) => value + 1) }}>Volver a intentar</Button>}
      {numbers !== null && (
        <form onSubmit={save} className="mt-8 max-w-2xl space-y-6">
          {!metaConfigured && <p className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">La conexión con WhatsApp no está disponible. Puedes guardar los números; la prueba estará disponible cuando se configure la conexión.</p>}
          <div>
            <label htmlFor="notification-recipients" className="text-sm font-medium text-slate-800">Números destinatarios</label>
            <textarea id="notification-recipients" rows={5} value={numbers} disabled={busy} onChange={(event) => { setNumbers(event.target.value); setNotice(null); setError(null); setTestResults([]) }} placeholder={'+525512345678\n+525587654321'} aria-describedby="recipients-help" className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500" />
            <p id="recipients-help" className="mt-2 text-xs leading-5 text-slate-500">Hasta 10 números, uno por línea, con código de país. Para México: +52 y los 10 dígitos. Guarda la lista vacía para desactivar los avisos. El remitente no recibirá un aviso de su propio mensaje.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300" disabled={busy || !dirty}>{action === 'save' ? 'Guardando…' : 'Guardar números'}</Button>
            <Button variant="outline" onClick={() => { void sendTest() }} disabled={busy || dirty || !metaConfigured || !savedNumbers.trim()}>{action === 'test' ? 'Enviando…' : 'Enviar prueba'}</Button>
          </div>
          <p className="text-xs leading-5 text-slate-500">Guarda los cambios antes de probar. La prueba envía un mensaje real a todos los números guardados.</p>
          {notice && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
          {testResults.length > 0 && <ul aria-live="polite" className="space-y-2 text-sm">
            {testResults.map((result) => <li key={result.recipient} className={'rounded-xl p-3 ' + (result.accepted ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700')}>
              +{result.recipient}: {result.accepted ? 'Prueba aceptada por Meta. Comprueba la recepción en WhatsApp.' : result.error}
            </li>)}
          </ul>}
        </form>
      )}
    </section>
  )
}
