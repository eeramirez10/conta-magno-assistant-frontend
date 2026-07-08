
import { Link } from 'react-router'

import { cn } from '../lib/cn'
import { navSections } from '../navigation/nav.config'
import { NavSection } from '../navigation/NavSection'
import { useSidebar } from '../context/sidebar-context'


export function AppSidebar() {
  const { isExpanded, isHovered, isMobileOpen, setIsHovered } = useSidebar()
  const showText = isExpanded || isHovered || isMobileOpen

  return (
    <aside
      onMouseEnter={() => {
        if (!isExpanded) setIsHovered(true)
      }}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-slate-200 bg-white px-5 text-slate-950 transition-all duration-300 ease-in-out',
        showText ? 'w-[290px]' : 'w-[90px]',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0',
      )}
    >
      <div className={cn('flex h-20 items-center', showText ? 'justify-start' : 'justify-center')}>
        <Link to="/" className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-sm font-bold text-white">
            CM
          </span>
          {showText ? (
            <span>
              <span className="block text-sm font-semibold leading-5 text-slate-950">Conta Magno</span>
            </span>
          ) : null}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <nav className="space-y-7">
          {navSections.map((section) => (
            <NavSection key={section.label} section={section} />
          ))}
        </nav>
      </div>

    </aside>
  )
}
