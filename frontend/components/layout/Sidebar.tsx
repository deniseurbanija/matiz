'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusSquare, Heart, Bookmark, Settings } from 'lucide-react'

const serif = { fontFamily: 'var(--font-crimson), Georgia, serif' }

const navItems = [
  { icon: Home,       href: '/',        label: 'Inicio'  },
  { icon: PlusSquare, href: '/upload',   label: 'Subir'   },
  { icon: Heart,      href: '/profile',  label: 'Me gusta'},
  { icon: Bookmark,   href: '/profile',  label: 'Guardado'},
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-20 flex-none flex-col items-center gap-6 self-stretch border-r border-beige dark:border-dark-border bg-cream dark:bg-dark-bg px-4 py-6">
      {/* Logo mark */}
      <Link href="/" className="shrink-0">
        <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center select-none">
          <span className="text-white text-xl font-light" style={serif}>M</span>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex flex-1 flex-col items-center gap-2">
        {navItems.map(({ icon: Icon, href, label }, i) => (
          <Link
            key={i}
            href={href}
            aria-label={label}
            className={`p-2.5 rounded-xl transition-colors duration-200 ${
              pathname === href
                ? 'text-sage bg-linen dark:bg-dark-surface'
                : 'text-warm-gray hover:text-sage hover:bg-linen dark:hover:bg-dark-surface'
            }`}
          >
            <Icon size={20} strokeWidth={1.6} />
          </Link>
        ))}
      </nav>

      {/* Settings */}
      <Link
        href="/settings"
        aria-label="Configuración"
        className="p-2.5 rounded-xl text-warm-gray hover:text-sage hover:bg-linen dark:hover:bg-dark-surface transition-colors duration-200"
      >
        <Settings size={20} strokeWidth={1.6} />
      </Link>
    </aside>
  )
}
