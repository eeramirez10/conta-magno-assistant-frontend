import { useEffect, useState, type ReactNode } from 'react'

import { getCurrentSession, login as loginRequest, logout as logoutRequest, type AuthenticatedUser } from '../api/auth'
import { setUnauthorizedHandler } from '../../../shared/api/httpClient'
import { AuthContext, type AuthStatus } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('checking')
  const [user, setUser] = useState<AuthenticatedUser | null>(null)

  useEffect(() => {
    let active = true

    const clearSession = () => {
      if (!active) return
      setUser(null)
      setStatus('unauthenticated')
    }

    const removeUnauthorizedHandler = setUnauthorizedHandler(clearSession)

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
    const currentUser = await loginRequest(username, password)
    setUser(currentUser)
    setStatus('authenticated')
  }

  const logout = async (): Promise<void> => {
    try {
      await logoutRequest()
    } finally {
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
