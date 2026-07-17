import type { ReactNode } from 'react'

import { ChatIcon, ContactsIcon, HomeIcon, SettingsIcon } from './nav-icons'

export type NavItemConfig = {
  label: string
  path: string
  icon: ReactNode
  badge?: string
}

export type NavSectionConfig = {
  label: string
  items: NavItemConfig[]
}

export const navSections: NavSectionConfig[] = [
  {
    label: 'Operación',
    items: [
      {
        label: 'Dashboard',
        path: '/',
        icon: <HomeIcon />,
      },
      {
        label: 'Conversaciones',
        path: '/conversations',
        icon: <ChatIcon />,
      },
      {
        label: 'Contactos',
        path: '/contacts',
        icon: <ContactsIcon />,
      },
    ],
  },
  {
    label: 'Sistema',
    items: [
      {
        label: 'Settings',
        path: '/settings',
        icon: <SettingsIcon />,
      },
    ],
  },
]
