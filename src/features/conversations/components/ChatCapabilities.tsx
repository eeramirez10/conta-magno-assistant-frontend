import { AudioPlayer } from './AudioPlayer'
import { useToast } from '../../../shared/notifications/toastContext'
import { useEffect, useRef, useState } from 'react'
import { httpPostForm, httpPostJson } from '../../../shared/api/httpClient'
import { env } from '../../../config/env'
import { getSessionToken } from '../../auth/session-token'
export type Attachment = { id: string; messageId: string; name: string; mime: string; size: number; status: string; transcript: string | null; error: string | null }
export type Capabilities = { scopeControl?: {state: string}; uncertainMessages?: Array<{id:string;text:string}>; failures?: Array<{id:string;error:string}>; control: { sessionId: string; expiresAt: string } | null; serverNow: string; policy: { decision: string; reason?: string; remoteStatus?: string }; attachments: Attachment[] }
export function MediaCard({ attachment, onChanged }: { attachment: Attachment; onChanged?: () => Promise<void> }) {
  const notify = useToast()
  const [url,setUrl] = useState('')
  const [error,setError] = useState('')
  const [retry,setRetry] = useState(0)
  const [busy,setBusy] = useState(false)
  const audio = attachment.mime.startsWith('audio/')
  useEffect(() => {
    let objectUrl = ''; let disposed = false
    if (attachment.status !== 'READY') return
    void fetch(`${env.apiUrl}/api/attachments/${attachment.id}/content${audio ? '?playback=1' : ''}`, { cache:'no-store', headers: { Authorization: `Bearer ${getSessionToken()}`, Accept:attachment.mime, 'ngrok-skip-browser-warning':'true' } }).then(async r => {
      if (!r.ok) throw new Error(`Archivo no disponible (HTTP ${r.status})`)
      const type=r.headers.get('content-type') ?? ''
      if(type.includes('text/html')) throw new Error('El proxy devolvió una página HTML en lugar del archivo. Reintenta la descarga.')
      objectUrl = URL.createObjectURL(await r.blob()); if (disposed) URL.revokeObjectURL(objectUrl); else {setUrl(objectUrl);setError('')}
    }).catch(e => { if (!disposed) setError(e instanceof Error ? e.message : String(e)) })
    return () => { disposed = true; if(objectUrl) URL.revokeObjectURL(objectUrl) }
  },[attachment.id,attachment.status,audio,attachment.mime,retry])
  const retryFile=async()=>{
    setBusy(true);setError('')
    try {const result=await httpPostJson<{ok:boolean;message?:string},Record<string,never>>(`/api/attachments/${attachment.id}/retry`,{});if(!result.ok) throw new Error(result.message || 'No se pudo procesar');setRetry(n=>n+1)}
    catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false);await onChanged?.()}
  }
  useEffect(() => {
    if (attachment.error) notify(attachment.error, `attachment:${attachment.id}:${attachment.error}`)
    if (error) notify(error, `download:${attachment.id}:${retry}:${error}`)
  }, [attachment.error,attachment.id,error,retry,notify])
  return <div className="my-2 max-w-xl rounded-xl bg-white/10 p-3 text-sm text-white">
    <p>{attachment.name} · {Math.ceil(attachment.size/1024)} KB</p>
    {attachment.status === 'PENDING' && <p>Procesando archivo…</p>}
    {(error || attachment.error || attachment.status==='FAILED') && <button type="button" disabled={busy} className="underline" onClick={()=>void retryFile()}>{busy?'Reintentando…':'Reintentar archivo'}</button>}
    {url && attachment.mime.startsWith('image/') && <a href={url} target="_blank" rel="noreferrer"><img src={url} alt={attachment.name} className="max-h-72 rounded-lg" /></a>}
    {url && attachment.mime === 'application/pdf' && <iframe title={attachment.name} src={url} className="h-64 w-full" />}
    {url && audio && <AudioPlayer src={url} />}
    {url && <a href={url} download={attachment.name} className="underline">Descargar</a>}
    {attachment.transcript && <details><summary>Ver transcripción</summary><p className="whitespace-pre-wrap">{attachment.transcript}</p></details>}
  </div>
}
type ActionsProps={id:string;capabilities:Capabilities|null;refresh:()=>Promise<void>;setError:(text:string)=>void}
export function ConversationMenu({id,capabilities,refresh,setError}:ActionsProps) {
 const [open,setOpen]=useState(false)
 const [busy,setBusy]=useState(false)
 const root=useRef<HTMLDivElement>(null)
 const button=useRef<HTMLButtonElement>(null)
 useEffect(()=>{
  if(!open)return
  const outside=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false)}
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);button.current?.focus()}}
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',key)
  root.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus()
  return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key)}
 },[open])
 const policy=async(decision:string)=>{
  setBusy(true);setError('')
  try{const result=await httpPostJson<{data?:{warning?:string}}, {decision:string}>(`/api/conversations/${id}/policy`,{decision});setError(result.data?.warning??'')}
  catch(e){setError(e instanceof Error?e.message:String(e))}finally{setOpen(false);setBusy(false);await refresh()}
 }
 const blocked=capabilities?.policy.decision==='BLOCKED'
 return <div ref={root} className="relative" onContextMenu={e=>{e.preventDefault();setOpen(true)}}>
  <button ref={button} type="button" aria-label="Opciones de la conversación" aria-haspopup="menu" aria-expanded={open} onClick={()=>setOpen(v=>!v)} className="h-9 w-9 rounded-full text-xl text-[#cfd4d7] hover:bg-[#2a3942]">⋮</button>
  {open&&<div role="menu" aria-label="Opciones de la conversación" className="absolute right-0 top-11 z-50 w-64 rounded-xl border border-white/10 bg-[#233138] p-2 text-sm text-white shadow-xl">
   {capabilities?.policy.decision==='REVIEW'&&<button type="button" role="menuitem" disabled={busy} onClick={()=>void policy('APPROVED')} className="w-full rounded p-3 text-left hover:bg-white/10">Autorizar como prospecto</button>}
   {!!capabilities?.uncertainMessages?.length&&<button type="button" role="menuitem" disabled={busy} className="w-full rounded p-3 text-left hover:bg-white/10" onClick={()=>{setBusy(true);void Promise.all(capabilities.uncertainMessages!.map(m=>httpPostJson(`/api/conversations/${id}/messages/${m.id}/review-delivery`,{}))).then(()=>refresh()).catch(e=>setError(String(e))).finally(()=>{setBusy(false);setOpen(false)})}}>Marcar envíos inciertos como revisados</button>}
   <button type="button" role="menuitem" disabled={busy} onClick={()=>void policy(blocked?'APPROVED':'BLOCKED')} className="w-full rounded p-3 text-left hover:bg-white/10">{blocked?'Desbloquear número':'Bloquear número'}</button>
   {blocked&&capabilities?.policy.remoteStatus==='FAILED'&&<button type="button" role="menuitem" disabled={busy} onClick={()=>void policy('BLOCKED')} className="w-full rounded p-3 text-left hover:bg-white/10">Reintentar bloqueo en WhatsApp</button>}
  </div>}
 </div>
}
export function AttachmentPicker({id,capabilities,refresh,setError,caption,onFilesSent,disabled}:{caption:string;onFilesSent:()=>void;disabled:boolean}&ActionsProps){
 const [selected,setSelected]=useState<File[]>([])
 const [busy,setBusy]=useState(false)
 const input=useRef<HTMLInputElement>(null)
 const send=async()=>{
  setBusy(true);setError('')
  try{const form=new FormData();selected.forEach(f=>form.append('files',f));form.append('caption',caption);form.append('controlSessionId',capabilities?.control?.sessionId??'');await httpPostForm(`/api/conversations/${id}/attachments`,form);setSelected([]);onFilesSent()}
  catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false);await refresh()}
 }
 return <div className="relative shrink-0">
  <button type="button" disabled={busy||disabled} onClick={()=>input.current?.click()} aria-label="Adjuntar archivos" title="Adjuntar archivos" className="flex h-11 w-11 items-center justify-center rounded-full text-[#cfd4d7] hover:bg-white/10 disabled:opacity-40"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8 13 6-6a3 3 0 0 1 4 4l-8 8a5 5 0 0 1-7-7l8-8a2 2 0 0 1 3 3l-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></button>
  <input ref={input} hidden type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.csv,.xml,.txt" onChange={e=>{const files=Array.from(e.target.files??[]);e.target.value='';if(files.length>5){setError('Selecciona hasta cinco archivos');return}setSelected(files)}}/>
  {selected.length>0&&<div className="absolute bottom-14 left-0 z-40 w-64 rounded-xl border border-white/10 bg-[#233138] p-4 text-sm text-white shadow-xl"><p className="mb-3 font-semibold">Archivos seleccionados</p>{selected.map((f,i)=><p key={i} className="break-words">{f.name} · {Math.ceil(f.size/1024)} KB</p>)}<div className="mt-3 flex gap-4"><button type="button" disabled={busy||disabled} onClick={()=>void send()} className="text-[#06cf9c] disabled:opacity-40">{busy?'Enviando…':'Enviar archivos'}</button><button type="button" disabled={busy} onClick={()=>setSelected([])}>Cancelar</button></div></div>}
 </div>
}
export function ChatStatus({capabilities,error}:{capabilities:Capabilities|null;error:string}){
 const notify=useToast()
 useEffect(()=>{
  if(error)notify(error,`chat:${error}`)
  const failures=capabilities?.failures??[]
  if(failures.length)notify('No se pudo completar el procesamiento. Intenta nuevamente en unos segundos.',`jobs:${failures.map(f=>f.id).sort().join(',')}`)
 },[error,capabilities?.failures,notify])
 return <div className="space-y-1 px-1 pt-2 text-xs text-amber-200" aria-live="polite">
  {capabilities?.scopeControl?.state==='PAUSED'&&<p>IA en silencio por tema ajeno. Retomará al consultar sobre Conta Magno.</p>}
  {capabilities?.policy.decision==='REVIEW'&&<p>Mensaje pendiente de revisión. Puedes autorizarlo desde el menú ⋮.</p>}
  {capabilities?.policy.decision==='BLOCKED'&&<p>Número bloqueado.</p>}
  {!!capabilities?.uncertainMessages?.length&&<p>Envío pendiente de revisión. Revisa su recepción desde el menú ⋮.</p>}
 </div>
}
