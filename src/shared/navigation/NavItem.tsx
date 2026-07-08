import { NavLink } from 'react-router'

import { cn } from '../lib/cn'
import type { NavItemConfig } from './nav.config'
import { useSidebar } from '../context/sidebar-context'

type NavItemProps = {
  item: NavItemConfig
}

export function NavItem({ item }: NavItemProps) {
  const { isExpanded, isHovered, isMobileOpen, closeMobileSidebar } = useSidebar()
  const showText = isExpanded || isHovered || isMobileOpen

  return (
    <NavLink
      to={item.path}
      onClick={closeMobileSidebar}
      className={({ isActive }) =>
        cn(
          'group relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
          showText ? 'justify-start' : 'justify-center',
          isActive
            ? 'bg-blue-50 text-blue-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
        )
      }
    >
      <span className="flex size-6 shrink-0 items-center justify-center">{item.icon}</span>
      {showText ? <span className="truncate">{item.label}</span> : null}
      {showText && item.badge ? (
        <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
          {item.badge}
        </span>
      ) : null}
    </NavLink>
  )
}
