import { createContext, useContext } from 'react'
export const ToastContext = createContext<(message: string, key?: string) => void>(() => undefined)
export const useToast = () => useContext(ToastContext)
