import { useCallback,useEffect,useRef,useState } from 'react'
import { httpGet,httpPostJson } from '../../../shared/api/httpClient'
import { useRealtime } from '../../../shared/realtime/realtime-context'
import type { Capabilities } from '../components/ChatCapabilities'
export function useChatCapabilities(id?: string) {
  const [data,setData] = useState<Capabilities | null>(null)
  const [error,setError] = useState('')
  const [now,setNow] = useState(() => Date.now())
  const [offset,setOffset] = useState(0)
  const { socket } = useRealtime()
  const lastActivity = useRef(0)
  const refresh = useCallback(async () => {
    if (!id) { setData(null); return }
    try { const result = await httpGet<{ data: Capabilities }>(`/api/conversations/${id}/capabilities`); setData(result.data); setOffset(Date.parse(result.data.serverNow)-Date.now()) }
    catch(e) { setError(e instanceof Error ? e.message : 'No se pudo actualizar el chat') }
  },[id])
  useEffect(() => {
    const timer = window.setTimeout(() => { void refresh() },0)
    const update = (e: { conversationId: string }) => { if (e.conversationId === id) void refresh() }
    socket.on('conversation:updated',update)
    const interval = window.setInterval(() => { void refresh() }, 10_000)
    return () => { clearTimeout(timer); clearInterval(interval); socket.off('conversation:updated',update) }
  },[id,refresh,socket])
  useEffect(() => { const timer=setInterval(()=>setNow(Date.now()),1000); return ()=>clearInterval(timer) },[])
  const activity = useCallback(() => {
    if (!id || !data?.control || Date.now()-lastActivity.current < 1000) return
    lastActivity.current = Date.now()
    const sendHttp = () => { void httpPostJson<{data:Capabilities},{controlSessionId:string}>(`/api/conversations/${id}/activity`,{controlSessionId:data.control!.sessionId}).then(r=>setData(r.data)).catch(e=>setError(String(e))) }
    if (!socket.connected) { sendHttp(); return }
    const fallback = window.setTimeout(sendHttp,3000)
    socket.emit('conversation:activity',{conversationId:id,controlSessionId:data.control.sessionId},result=>{
      clearTimeout(fallback)
      if (!result.ok || !result.expiresAt) { sendHttp(); return }
      setData(current=>current?.control?.sessionId===data.control!.sessionId?{...current,control:{...current.control,expiresAt:result.expiresAt!}}:current)
    })
  },[id,data,socket])
  return { data,error,refresh,activity,setError,now: now+offset }
}
