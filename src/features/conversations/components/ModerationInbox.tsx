import { useCallback, useEffect, useState } from 'react'
import { httpGet, httpPostJson } from '../../../shared/api/httpClient'
import { useRealtime } from '../../../shared/realtime/realtime-context'
type Policy = { waId: string; decision: string; reason: string | null; remoteStatus: string | null }
export function ModerationInbox({ onPolicies }: { onPolicies: (items: Policy[]) => void }) {
  const [items,setItems] = useState<Policy[]>([])
  const [error,setError] = useState('')
  const {socket} = useRealtime()
  const load = useCallback(async () => { try { const r = await httpGet<{items: Policy[]}>('/api/chat-policies'); setItems(r.items); onPolicies(r.items) } catch(e) {setError(String(e))} },[onPolicies])
  useEffect(() => { const timer=setTimeout(() => {void load()},0); const listener=() => {void load()}; socket.on('conversation:updated',listener); return () => {clearTimeout(timer);socket.off('conversation:updated',listener)} },[load,socket])
  const act = async (waId: string,decision: string) => { try { await httpPostJson(`/api/chat-policies/${waId}`,{decision}); await load() } catch(e) {setError(String(e));await load()} }
  return <details className="mb-3 rounded-xl bg-slate-800 p-3 text-white"><summary>Revisión y bloqueos ({items.filter(i=>['REVIEW','BLOCKED'].includes(i.decision)).length})</summary>
    {error && <p>{error}</p>}
    {items.filter(i=>['REVIEW','BLOCKED'].includes(i.decision)).map(i=><div key={i.waId} className="my-2 border-t border-white/10 p-2 text-sm"><strong>{i.waId}</strong> · {i.decision==='BLOCKED'?'Bloqueado':'Pendiente de revisión'}<p>{i.reason}</p>{i.remoteStatus==='FAILED'&&<p>Bloqueo de WhatsApp pendiente de sincronizar</p>}<button className="mr-4 underline" onClick={()=>void act(i.waId,'APPROVED')}>{i.decision==='BLOCKED'?'Desbloquear':'Autorizar como prospecto'}</button><button className="underline" onClick={()=>void act(i.waId,'BLOCKED')}>Bloquear / reintentar</button></div>)}
  </details>
}
