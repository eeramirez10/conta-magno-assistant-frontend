import { createBrowserRouter } from 'react-router'

import { AppShell } from '../app/AppShell'
import { ConversationsPage } from '../pages/ConversationsPage'
import { DashboardPage } from '../pages/DashboardPage'
import { SettingsPage } from '../pages/SettingsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppShell,
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
        path: 'settings',
        Component: SettingsPage,
      },
    ],
  },
])
