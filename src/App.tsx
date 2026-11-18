
import { ToastProvider } from './shared/notifications/ToastProvider'
import { RouterProvider } from 'react-router'
import './App.css'
import { router } from './config/router'
import { AuthProvider } from './features/auth/context/AuthProvider'
import { RealtimeProvider } from './shared/realtime/RealtimeProvider'

function App() {

  return (
    <ToastProvider><AuthProvider>
      <RealtimeProvider>
        <RouterProvider router={router} />
      </RealtimeProvider>
    </AuthProvider></ToastProvider>
  )
}

export default App
