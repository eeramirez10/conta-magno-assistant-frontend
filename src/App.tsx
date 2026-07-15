
import { RouterProvider } from 'react-router'
import './App.css'
import { router } from './config/router'
import { AuthProvider } from './features/auth/context/AuthProvider'

function App() {

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
