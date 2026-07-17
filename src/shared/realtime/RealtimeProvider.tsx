import { useEffect, useState, type ReactNode } from 'react'
import { io } from 'socket.io-client'

import { env } from '../../config/env'
import { useAuth } from '../../features/auth/context/auth-context'
import { getSessionToken } from '../../features/auth/session-token'
import { RealtimeContext, type RealtimeSocket } from './realtime-context'

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const [connected, setConnected] = useState(false)
  const [socket] = useState<RealtimeSocket>(() => io(env.realtimeUrl, {
    autoConnect: false,
    addTrailingSlash: false,
    auth: (callback) => callback({ token: getSessionToken() }),
  }))

  useEffect(() => {
    const handleConnect = () => setConnected(true)
    const handleDisconnect = () => setConnected(false)

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.disconnect()
    }
  }, [socket])

  useEffect(() => {
    if (status === 'authenticated') {
      socket.connect()
      return
    }

    socket.disconnect()
  }, [socket, status])

  return (
    <RealtimeContext.Provider value={{ socket, connected }}>
      {children}
    </RealtimeContext.Provider>
  )
}
