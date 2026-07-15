import { Navigate, useLocation } from 'react-router'

import { AppShell } from '../../../app/AppShell'
import { useAuth } from '../context/auth-context'

export function ProtectedAppShell() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'checking') {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">
        Validando sesión...
      </main>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <AppShell />
}
