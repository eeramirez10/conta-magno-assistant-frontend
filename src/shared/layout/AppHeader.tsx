import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { useSidebar } from '../context/sidebar-context'
import { cn } from '../lib/cn'
import { navSections } from '../navigation/nav.config'
import { useAuth } from '../../features/auth/context/auth-context'

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 5h14M3 10h10M3 15h14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="m14.2 14.2 3.3 3.3M8.8 15.2a6.4 6.4 0 1 1 0-12.8 6.4 6.4 0 0 1 0 12.8Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export function AppHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isExpanded, isHovered, isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar()
  const { logout, user } = useAuth()

  const currentItem = useMemo(
    () => navSections.flatMap((section) => section.items).find((item) => item.path === location.pathname),
    [location.pathname],
  )

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar()
      return
    }

    toggleMobileSidebar()
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur transition-[margin] duration-300',
        isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]',
        isMobileOpen ? 'ml-0' : '',
      )}
    >
      <div className="flex h-20 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={handleToggle}
            className="grid size-11 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            aria-label="Toggle sidebar"
          >
            <MenuIcon />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-slate-950 md:text-xl">
              {currentItem?.label ?? 'Conversaciones'}
            </h1>
          </div>
        </div>

        <div className="hidden min-w-[280px] max-w-md flex-1 items-center lg:flex">
          <label className="relative w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <SearchIcon />
            </span>
            <input
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
              placeholder="Buscar conversación o lead"
              type="search"
            />
          </label>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="max-w-32 truncate text-sm font-medium text-slate-800">{user?.username}</p>
            <p className="text-xs text-slate-500">Administrador</p>
          </div>
          <div className="grid size-10 place-items-center rounded-full bg-slate-900 text-sm font-semibold text-white">CM</div>
          <button
            type="button"
            onClick={() => navigate('/conversations')}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
          >
            Inbox
          </button>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  )
}
