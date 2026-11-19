import { realtimeConfig } from '../shared/realtime/realtimeConfig'

const apiUrl = import.meta.env.VITE_API_URL;

if(!apiUrl){
  throw new Error('Falta VITE_API_URL en .env.local')
}

const realtime = realtimeConfig(apiUrl, import.meta.env.VITE_SOCKET_IO_PATH)

export const env = {
  apiUrl,
  realtimeUrl: realtime.origin,
  realtimePath: realtime.path,
}
