import { createContext, useContext } from 'react'
import type { Socket } from 'socket.io-client'

import type { ClientToServerEvents, ServerToClientEvents } from './events'

export type RealtimeSocket = Socket<ServerToClientEvents, ClientToServerEvents>

export type RealtimeContextValue = {
  socket: RealtimeSocket
  connected: boolean
}

export const RealtimeContext = createContext<RealtimeContextValue | null>(null)

export function useRealtime(): RealtimeContextValue {
  const context = useContext(RealtimeContext)

  if (!context) {
    throw new Error('useRealtime debe usarse dentro de RealtimeProvider')
  }

  return context
}
