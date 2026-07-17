import { useEffect, useState, type ReactNode } from 'react'

import { getCurrentSession, login as loginRequest, logout as logoutRequest, type AuthenticatedUser } from '../api/auth'
import { setUnauthorizedHandler } from '../../../shared/api/httpClient'
import { AuthContext, type AuthStatus } from './auth-context'
import { clearSessionToken, getSessionToken, setSessionToken } from '../session-token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('checking')
  const [user, setUser] = useState<AuthenticatedUser | null>(null)

  useEffect(() => {
    let active = true

    const clearSession = () => {
      if (!active) return
      clearSessionToken()
      setUser(null)
      setStatus('unauthenticated')
    }

    const removeUnauthorizedHandler = setUnauthorizedHandler(clearSession)

    const token = getSessionToken()
    if (!token) {
      clearSession()
      return removeUnauthorizedHandler
    }

    getCurrentSession()
      .then((currentUser) => {
        if (!active) return
        setUser(currentUser)
        setStatus('authenticated')
      })
      .catch(clearSession)

    return () => {
      active = false
      removeUnauthorizedHandler()
    }
  }, [])

  const login = async (username: string, password: string): Promise<void> => {
    const session = await loginRequest(username, password)
    setSessionToken(session.token)
    setUser(session.user)
    setStatus('authenticated')
  }

  const logout = async (): Promise<void> => {
    try {
      await logoutRequest()
    } finally {
      clearSessionToken()
      setUser(null)
      setStatus('unauthenticated')
    }
  }

  return (
    <AuthContext.Provider value={{ status, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
