import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../features/auth/context/AuthProvider'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, status } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'

  useEffect(() => {
    if (status === 'authenticated') {
      navigate(redirectTo, { replace: true })
    }
  }, [navigate, redirectTo, status])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login(username, password)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo iniciar sesión')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'authenticated') {
    return <Navigate to={redirectTo} replace />
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#071017] px-5 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,168,132,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,116,144,0.14),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:28px_28px]" />

      <section className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-[#111b21]/95 p-7 shadow-[0_32px_90px_rgba(0,0,0,0.45)] sm:p-10">
        <header className="text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-white text-lg font-bold tracking-tight text-[#071017] shadow-[0_12px_32px_rgba(0,0,0,0.3)]">
            CM
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-[#e9edef]">Conta Magno</h1>
          <p className="mt-2 text-sm text-[#8696a0]">Ingresa para administrar tus conversaciones.</p>
        </header>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#cfd4d7]">Usuario</span>
            <input
              type="text"
              name="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
              className="h-12 w-full rounded-xl border border-white/10 bg-[#202c33] px-4 text-sm text-[#e9edef] outline-none transition placeholder:text-[#667781] focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20"
              placeholder="Escribe tu usuario"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#cfd4d7]">Contraseña</span>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="h-12 w-full rounded-xl border border-white/10 bg-[#202c33] px-4 text-sm text-[#e9edef] outline-none transition placeholder:text-[#667781] focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20"
              placeholder="Escribe tu contraseña"
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl bg-white text-sm font-semibold text-[#071017] transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#111b21] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
      </section>
    </main>
  )
}
