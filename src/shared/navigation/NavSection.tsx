import { useSidebar } from '../context/sidebar-context'
import type { NavSectionConfig } from './nav.config'
import { NavItem } from './NavItem'

type NavSectionProps = {
  section: NavSectionConfig
}

export function NavSection({ section }: NavSectionProps) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar()
  const showText = isExpanded || isHovered || isMobileOpen

  return (
    <section className="space-y-2">
      <div className={showText ? 'px-3' : 'flex justify-center'}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          {showText ? section.label : '...'}
        </p>
      </div>
      <ul className="space-y-1">
        {section.items.map((item) => (
          <li key={item.path}>
            <NavItem item={item} />
          </li>
        ))}
      </ul>
    </section>
  )
}
