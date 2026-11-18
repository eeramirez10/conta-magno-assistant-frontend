import { useEffect, useRef, useState } from 'react'
import { httpPostForm, httpPostJson } from '../../../shared/api/httpClient'
import { env } from '../../../config/env'
import { getSessionToken } from '../../auth/session-token'
export type Attachment = { id: string; messageId: string; name: string; mime: string; size: number; status: string; transcript: string | null; error: string | null }
export type Capabilities = { uncertainMessages?: Array<{id:string;text:string}>; failures?: Array<{id:string;error:string}>; control: { sessionId: string; expiresAt: string } | null; serverNow: string; policy: { decision: string; reason?: string; remoteStatus?: string }; attachments: Attachment[] }
export function MediaCard({ attachment }: { attachment: Attachment }) {
  const [url,setUrl] = useState('')
  const [error,setError] = useState('')
  const audio = attachment.mime.startsWith('audio/')
  useEffect(() => {
    let objectUrl = ''; let disposed = false
    if (attachment.status !== 'READY') return
    void fetch(`${env.apiUrl}/api/attachments/${attachment.id}/content${audio ? '?playback=1' : ''}`, { headers: { Authorization: `Bearer ${getSessionToken()}` } }).then(async r => {
      if (!r.ok) throw new Error('Archivo no disponible')
      objectUrl = URL.createObjectURL(await r.blob()); if (disposed) URL.revokeObjectURL(objectUrl); else setUrl(objectUrl)
    }).catch(e => { if (!disposed) setError(String(e)) })
    return () => { disposed = true; if(objectUrl) URL.revokeObjectURL(objectUrl) }
  },[attachment.id,attachment.status,audio])
  return <div className="my-2 max-w-xl rounded-xl bg-white/10 p-3 text-sm text-white">
    <p>{attachment.name} · {Math.ceil(attachment.size/1024)} KB</p>
    {attachment.status === 'PENDING' && <p>Procesando archivo…</p>}
    {attachment.error && <p className="text-rose-300">{attachment.error}</p>}
    {error && <p>{error}</p>}
    {url && attachment.mime.startsWith('image/') && <a href={url} target="_blank" rel="noreferrer"><img src={url} alt={attachment.name} className="max-h-72 rounded-lg" /></a>}
    {url && attachment.mime === 'application/pdf' && <iframe title={attachment.name} src={url} className="h-64 w-full" />}
    {url && audio && <audio controls preload="metadata" src={url} className="max-w-full" />}
    {url && <a href={url} download={attachment.name} className="underline">Descargar</a>}
    {attachment.transcript && <details><summary>Ver transcripción</summary><p className="whitespace-pre-wrap">{attachment.transcript}</p></details>}
  </div>
}
export function ChatActions({ id, capabilities, refresh, error, setError, caption, onFilesSent }: { caption: string; onFilesSent: () => void; id: string; capabilities: Capabilities | null; refresh: () => Promise<void>; error: string; setError: (value: string) => void }) {
  const [now,setNow] = useState(() => Date.now())
  const [selected,setSelected] = useState<File[]>([])
  const [busy,setBusy] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()),1000); return () => clearInterval(timer) },[])
  const run = async (work: () => Promise<unknown>) => { setBusy(true); setError(''); try { await work(); await refresh() } catch(e) { setError(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) } }
  const policy = async (decision: string) => httpPostJson(`/api/conversations/${id}/policy`,{ decision })
  const remaining = Math.max(0,Math.ceil((Date.parse(capabilities?.control?.expiresAt ?? '')-now)/1000)) || 0
  return <div className="space-y-2 px-5 py-2 text-xs text-white">
    <p>{capabilities?.control && remaining > 0 ? `Control humano · ${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')} · se renueva al escribir` : 'Sin sesión de control humano activa'}</p>
    {capabilities?.policy.decision === 'REVIEW' && <p className="text-amber-200">Pendiente de revisión: {capabilities.policy.reason} <button onClick={() => void run(() => policy('APPROVED'))} className="underline">Autorizar como prospecto</button></p>}
    {capabilities?.policy.remoteStatus === 'FAILED' && <p>Bloqueo en el panel activo; sincronización con WhatsApp fallida. Pulsa bloquear para reintentar.</p>}
    <div className="flex flex-wrap gap-4">
      <button disabled={busy || !remaining} onClick={() => input.current?.click()} className="underline">Adjuntar archivos</button>
      <input ref={input} hidden type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.csv,.xml,.txt" onChange={e => {
        const files = Array.from(e.target.files ?? []); e.target.value=''
        if (files.length > 5) { setError('Selecciona hasta cinco archivos'); return }
        setSelected(files)
      }} />
      {selected.length > 0 && <div><p>{selected.map(f=>`${f.name} (${Math.ceil(f.size/1024)} KB)`).join(', ')}</p><button disabled={busy || !remaining} className="underline" onClick={()=>void run(async()=>{const form=new FormData();selected.forEach(f=>form.append('files',f));form.append('caption',caption);form.append('controlSessionId',capabilities?.control?.sessionId ?? '');await httpPostForm(`/api/conversations/${id}/attachments`,form);setSelected([]);onFilesSent()})}>Enviar archivos</button> <button onClick={()=>setSelected([])}>Cancelar</button></div>}
      <button disabled={busy || !remaining} className="underline" onClick={() => void run(async () => {
        const r = await httpPostJson<{ url: string },{ controlSessionId: string }>(`/api/conversations/${id}/file-links`,{ controlSessionId: capabilities!.control!.sessionId })
        await navigator.clipboard.writeText(r.url); setError('Enlace copiado. Pégalo y envíalo al prospecto para solicitar el archivo.')
      })}>Solicitar archivo</button>
      <button disabled={busy} className="underline" onClick={() => void run(() => policy(capabilities?.policy.decision === 'BLOCKED' ? 'APPROVED' : 'BLOCKED'))}>{capabilities?.policy.decision === 'BLOCKED' ? 'Desbloquear número' : 'Bloquear número'}</button>
    </div>
    {capabilities?.uncertainMessages?.map(m=><p key={m.id} className="text-amber-200">Envío de resultado incierto. Revisa si el prospecto lo recibió antes de reenviar. <button className="underline" onClick={()=>void run(()=>httpPostJson(`/api/conversations/${id}/messages/${m.id}/review-delivery`,{}))}>Marcar revisado</button></p>)}
    {capabilities?.failures?.map(f=><p key={f.id} className="text-rose-300">{f.error}. Revisa la conversación antes de volver a enviar.</p>)}
    {error && <p className="text-amber-200">{error}</p>}
  </div>
}
