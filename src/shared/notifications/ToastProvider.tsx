import { useCallback, useRef, useState, type ReactNode } from 'react'
import { Alert, Snackbar, ThemeProvider } from '@mui/material'
import { chatTheme } from './chatTheme'
import { ToastContext } from './toastContext'
type Notice = { message: string; key: number }
export function ToastProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<Notice | null>(null)
  const seen = useRef(new Set<string>())
  const notify = useCallback((message: string, key?: string) => {
    if (!message || (key && seen.current.has(key))) return
    if (key) seen.current.add(key)
    setNotice({ message, key: Date.now() })
  }, [])
  return <ToastContext.Provider value={notify}>{children}<ThemeProvider theme={chatTheme}><Snackbar sx={{ zIndex: 200000 }} key={notice?.key} open={!!notice} autoHideDuration={6000} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} onClose={(_, reason) => { if (reason !== 'clickaway') setNotice(null) }}><Alert severity="error" variant="filled" onClose={() => setNotice(null)} sx={{ maxWidth: 'min(480px, 90vw)' }}>{notice?.message}</Alert></Snackbar></ThemeProvider></ToastContext.Provider>
}
