const sessionTokenKey = 'conta-magno:admin-session-token'

export function getSessionToken(): string | null {
  return sessionStorage.getItem(sessionTokenKey)
}

export function setSessionToken(token: string): void {
  sessionStorage.setItem(sessionTokenKey, token)
}

export function clearSessionToken(): void {
  sessionStorage.removeItem(sessionTokenKey)
}
