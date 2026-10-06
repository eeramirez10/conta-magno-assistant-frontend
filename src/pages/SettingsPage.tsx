import { useEffect, useState, type FormEvent } from 'react'
import {
  getIncomingNotificationSettings,
  saveIncomingNotificationSettings,
  testIncomingNotificationSettings,
  type IncomingNotificationSettings,
  type NotificationTestResult,
} from '../features/settings/api/incomingNotifications'
import Button from '../shared/ui/button/Button'

type SettingsForm = {
  enabled: boolean
  recipientsText: string
  templateName: string
  languageCode: string
  templateMode: IncomingNotificationSettings['templateMode']
}

function toForm(settings: IncomingNotificationSettings): SettingsForm {
  return { enabled: settings.enabled, templateName: settings.templateName, languageCode: settings.languageCode, templateMode: settings.templateMode ?? 'INCOMING_MESSAGE', recipientsText: settings.recipients.map((number) => `+${number}`).join('\n') }
}

const templateBody = 'Conta Magno: recibiste un nuevo mensaje de {{1}} (WhatsApp {{2}}). Revisa la conversación en el panel de atención.'
const inputClass = 'mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500'

export function SettingsPage() {
  const [form, setForm] = useState<SettingsForm | null>(null)
  const [savedForm, setSavedForm] = useState<SettingsForm | null>(null)
  const [metaConfigured, setMetaConfigured] = useState(false)
  const [ownerLeadTemplate, setOwnerLeadTemplate] = useState<{ name: string; languageCode: string } | null>(null)
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
        const nextForm = toForm(response.data)
        setForm(nextForm)
        setSavedForm(nextForm)
        setMetaConfigured(response.metaConfigured)
        setOwnerLeadTemplate(response.ownerLeadTemplate ?? null)
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'No se pudo cargar la configuración')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [loadVersion])

  const dirty = JSON.stringify(form) !== JSON.stringify(savedForm)
  const busy = action !== null

  function edit(values: Partial<SettingsForm>) {
    setForm((current) => current ? { ...current, ...values } : current)
    setNotice(null)
    setError(null)
    setTestResults([])
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form || busy) return
    setAction('save')
    setError(null)
    setNotice(null)
    setTestResults([])
    try {
      const response = await saveIncomingNotificationSettings({
        enabled: form.enabled,
        recipients: form.recipientsText.split(/[\n,;]+/).map((number) => number.trim()).filter(Boolean),
        templateName: form.templateName.trim(),
        languageCode: form.languageCode.trim(),
        templateMode: form.templateMode,
      })
      const nextForm = toForm(response.data)
      setForm(nextForm)
      setSavedForm(nextForm)
      setMetaConfigured(response.metaConfigured)
      setOwnerLeadTemplate(response.ownerLeadTemplate ?? null)
      setNotice(response.data.enabled ? 'Configuración guardada. Los avisos están activados.' : 'Configuración guardada. Los avisos están desactivados.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la configuración')
    } finally {
      setAction(null)
    }
  }

  async function sendTest() {
    if (busy || dirty) return
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
      <h1 className="mt-3 text-2xl font-semibold text-slate-950">Avisos de mensajes de WhatsApp</h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
        Recibe un solo aviso por contacto al primer mensaje de cada ciclo, también durante atención humana.
        Los siguientes mensajes no repiten el aviso. Cuando el lead se marca como calificado o se completa su calificación,
        el siguiente mensaje podrá generar un nuevo aviso. La IA seguirá respondiendo según el control de la conversación.
      </p>
      {loading && <p role="status" className="mt-6 text-sm text-slate-500">Cargando configuración…</p>}
      {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {!loading && !form && (
        <Button className="mt-4" variant="outline" onClick={() => { setLoading(true); setError(null); setLoadVersion((value) => value + 1) }}>
          Volver a intentar
        </Button>
      )}
      {form && (
        <form onSubmit={save} className="mt-8 max-w-2xl space-y-6">
          {!metaConfigured && <p className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">Falta configurar Meta WhatsApp en el backend. Puedes guardar los destinatarios y la plantilla; podrás activar los avisos cuando se configure la conexión.</p>}
          <fieldset disabled={busy} className="space-y-6 disabled:opacity-70">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
              <input type="checkbox" checked={form.enabled} disabled={!metaConfigured && !form.enabled} onChange={(event) => edit({ enabled: event.target.checked })} className="mt-1 h-4 w-4 accent-blue-600" />
              <span>
                <span className="block text-sm font-semibold text-slate-900">Activar notificaciones por WhatsApp</span>
                <span className="mt-1 block text-sm text-slate-500">Se aplica al guardar. Usa una plantilla aprobada antes de activar los avisos.</span>
              </span>
            </label>
            <div>
              <label htmlFor="notification-recipients" className="text-sm font-medium text-slate-800">Números destinatarios</label>
              <textarea id="notification-recipients" rows={4} value={form.recipientsText} onChange={(event) => edit({ recipientsText: event.target.value })} placeholder={'+525512345678\n+525587654321'} required={form.enabled} aria-describedby="recipients-help" className={inputClass} />
              <p id="recipients-help" className="mt-2 text-xs leading-5 text-slate-500">Hasta 10 números, uno por línea, con código de país. Para México: +52 y los 10 dígitos. Añade únicamente personas de tu equipo que hayan aceptado recibir estos avisos. El remitente no recibirá un aviso de su propio mensaje.</p>
            </div>
            <div>
              <label htmlFor="notification-template-mode" className="text-sm font-medium text-slate-800">Plantilla para el aviso inicial</label>
              <select id="notification-template-mode" value={form.templateMode} onChange={(event) => edit({ templateMode: event.target.value as SettingsForm['templateMode'] })} className={inputClass}>
                <option value="INCOMING_MESSAGE">Plantilla propia de mensaje recibido</option>
                <option value="OWNER_LEAD" disabled={!ownerLeadTemplate}>Reutilizar plantilla actual de solicitudes de prospectos</option>
              </select>
              {form.templateMode === 'OWNER_LEAD' ? (
                <p className="mt-2 text-sm leading-6 text-slate-600">Se usará <strong>{ownerLeadTemplate?.name ?? 'la plantilla de solicitudes configurada en el backend'}</strong>{ownerLeadTemplate ? ` (${ownerLeadTemplate.languageCode})` : ''}, con folio, nombre, WhatsApp, correo, necesidad y plan. Los datos aún desconocidos se enviarán como “Pendiente”; si todavía no hay folio, aparecerá “Primer contacto”. La notificación de solicitud calificada seguirá enviándose al completar los datos.</p>
              ) : <p className="mt-2 text-xs leading-5 text-slate-500">La plantilla propia usa dos datos: nombre y WhatsApp del contacto. Puedes crearla con la guía de abajo.</p>}
              {!ownerLeadTemplate && <p className="mt-2 text-xs leading-5 text-slate-500">La opción de reutilizar estará disponible cuando se configure la plantilla de solicitudes en el backend.</p>}
            </div>
            {form.templateMode === 'INCOMING_MESSAGE' && <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="notification-template" className="text-sm font-medium text-slate-800">Nombre de la plantilla aprobada</label>
                <input id="notification-template" value={form.templateName} onChange={(event) => edit({ templateName: event.target.value })} required maxLength={512} pattern="[a-z0-9_]+" className={inputClass} />
              </div>
              <div>
                <label htmlFor="notification-language" className="text-sm font-medium text-slate-800">Código de idioma de la plantilla</label>
                <input id="notification-language" value={form.languageCode} onChange={(event) => edit({ languageCode: event.target.value })} required placeholder="es_MX" aria-describedby="language-help" className={inputClass} />
                <p id="language-help" className="mt-2 text-xs text-slate-500">Debe coincidir con Meta: es_MX para Español (México), es para Español.</p>
              </div>
            </div>}
          </fieldset>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300" disabled={busy || !dirty}>{action === 'save' ? 'Guardando…' : 'Guardar configuración'}</Button>
            <Button variant="outline" onClick={() => { void sendTest() }} disabled={busy || dirty || !metaConfigured || !savedForm?.recipientsText.trim()}>{action === 'test' ? 'Enviando…' : 'Enviar prueba'}</Button>
          </div>
          <p className="text-xs leading-5 text-slate-500">La prueba envía un mensaje real a todos los destinatarios guardados, incluso con los avisos desactivados. Guarda los cambios antes de probar. Meta puede cobrar cada aviso enviado.</p>
          {notice && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
          {testResults.length > 0 && (
            <ul aria-live="polite" className="space-y-2 text-sm">
              {testResults.map((result) => <li key={result.recipient} className={`rounded-xl p-3 ${result.accepted ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
                +{result.recipient}: {result.accepted ? 'Prueba aceptada por Meta. Comprueba la recepción en WhatsApp.' : result.error}
              </li>)}
            </ul>
          )}
        </form>
      )}
      <details className="mt-8 max-w-2xl rounded-xl border border-slate-200 p-4 sm:p-5 [&_code]:break-all">
        <summary className="cursor-pointer text-sm font-semibold text-slate-900">Cómo crear una plantilla propia en Meta (opcional)</summary>
        <p className="mt-4 text-sm leading-6 text-slate-600">Si reutilizas la plantilla actual de solicitudes, no necesitas crear esta plantilla. Comprueba que su texto también tenga sentido cuando los datos del prospecto aún estén pendientes.</p>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-600">
          <li>Entra a WhatsApp Manager, selecciona la cuenta conectada a este backend y abre Plantillas de mensajes → Crear plantilla.</li>
          <li>Usa el nombre <code>aviso_mensaje_recibido</code> y el idioma Español (México), código <code>es_MX</code>. Para este aviso operativo recomendamos solicitar la categoría Utilidad; Meta decide su clasificación y aprobación.</li>
          <li>Crea una plantilla de texto con solo cuerpo y variables numéricas. Copia este texto:</li>
        </ol>
        <pre className="mt-4 whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-800">{templateBody}</pre>
        <p className="mt-4 text-sm leading-6 text-slate-600">Para las muestras, usa <code>{'{{1}}'}</code>: María Pérez y <code>{'{{2}}'}</code>: +525555555555. No añadas encabezados, botones ni más variables. Envía la plantilla a revisión y espera el estado Aprobada.</p>
        <p className="mt-3 text-sm leading-6 text-slate-600">Después guarda aquí su nombre e idioma exactos, añade tus números y envía una prueba. Cuando recibas el aviso, activa las notificaciones y guarda.</p>
        <a className="mt-4 inline-block text-sm font-medium text-blue-600 underline" href="https://business.facebook.com/wa/manage/message-templates/" target="_blank" rel="noreferrer">Abrir WhatsApp Manager</a>
      </details>
    </section>
  )
}
