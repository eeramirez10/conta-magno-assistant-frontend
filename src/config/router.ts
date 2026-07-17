import { createBrowserRouter } from 'react-router'

import { ConversationsPage } from '../pages/ConversationsPage'
import { DashboardPage } from '../pages/DashboardPage'
import { LoginPage } from '../pages/LoginPage'
import { SettingsPage } from '../pages/SettingsPage'
import { ContactsPage } from '../pages/ContactsPage'
import { ProtectedAppShell } from '../features/auth/components/ProtectedAppShell'

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/',
    Component: ProtectedAppShell,
    children: [
      {
        index: true,
        Component: DashboardPage,
      },
      {
        path: 'conversations',
        Component: ConversationsPage,
      },
      {
        path: 'contacts',
        Component: ContactsPage,
      },
      {
        path: 'settings',
        Component: SettingsPage,
      },
    ],
  },
])
