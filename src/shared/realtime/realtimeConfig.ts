export function realtimeConfig(apiUrl: string, pathOverride?: string) {
  const url = new URL(apiUrl)
  const prefix = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname
  return { origin: url.origin, path: pathOverride || `${prefix}/socket.io` }
}
