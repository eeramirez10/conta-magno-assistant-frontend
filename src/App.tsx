
import { RouterProvider } from 'react-router'
import './App.css'
import { router } from './config/router'
import { AuthProvider } from './features/auth/context/AuthProvider'
import { RealtimeProvider } from './shared/realtime/RealtimeProvider'

function App() {

  return (
    <AuthProvider>
      <RealtimeProvider>
        <RouterProvider router={router} />
      </RealtimeProvider>
    </AuthProvider>
  )
}

export default App
