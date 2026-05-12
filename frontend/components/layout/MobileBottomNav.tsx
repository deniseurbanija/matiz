'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Plus, Bookmark, User } from 'lucide-react'

interface NavItem {
  icon: React.ElementType
  href: string
  label: string
  isAction?: boolean
}

const items: NavItem[] = [
  { icon: Home,     href: '/',        label: 'Inicio'  },
  { icon: Compass,  href: '/',        label: 'Explorar'},
  { icon: Plus,     href: '/upload',  label: 'Subir', isAction: true },
  { icon: Bookmark, href: '/profile', label: 'Guardado'},
  { icon: User,     href: '/profile', label: 'Perfil'  },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden flex w-full items-center justify-around border-t border-beige dark:border-dark-border bg-cream dark:bg-dark-bg px-6 py-2.5">
      {items.map(({ icon: Icon, href, label, isAction }, i) => {
        const active = pathname === href && !isAction
        return (
          <Link
            key={i}
            href={href}
            aria-label={label}
            className="flex flex-col items-center gap-0.5"
          >
            {isAction ? (
              <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center">
                <Icon size={18} className="text-white" strokeWidth={2} />
              </div>
            ) : (
              <>
                <Icon
                  size={22}
                  strokeWidth={1.5}
                  className={active ? 'text-sage' : 'text-nav-inactive'}
                />
                <span
                  className={`text-[10px] ${active ? 'text-sage' : 'text-nav-inactive'}`}
                >
                  {label}
                </span>
              </>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
