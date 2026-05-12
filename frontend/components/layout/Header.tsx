'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Sun, Moon, Upload, LogIn, LogOut, User } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../lib/api'

export function Header() {
  const { theme, toggle } = useTheme()
  const { user, setUser } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await api.auth.logout()
      setUser(null)
      router.push('/')
    } catch {
      // ignore
    }
  }

  const isActive = (href: string) =>
    pathname === href ? 'text-sage dark:text-sage-light' : 'text-warm-gray hover:text-carbon dark:hover:text-cream-alt'

  return (
    <header className="sticky top-0 z-50 bg-cream/85 dark:bg-dark-bg/85 backdrop-blur-md border-b border-beige dark:border-dark-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="shrink-0 flex flex-col leading-none">
          <span
            className="text-[26px] sm:text-[32px] text-carbon dark:text-cream-alt tracking-[0.04em] select-none"
            style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontWeight: 300 }}
          >
            Matiz
          </span>
          <span
            className="hidden sm:block text-[10px] text-warm-gray tracking-[0.18em] uppercase -mt-0.5 select-none"
            style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontStyle: 'italic', letterSpacing: '0.15em' }}
          >
            edición fotográfica
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {user && (
            <Link
              href="/upload"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${isActive('/upload')}`}
            >
              <Upload size={15} />
              <span className="hidden sm:inline">Subir</span>
            </Link>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label="Cambiar tema"
            className="p-2 rounded-full text-warm-gray hover:text-carbon dark:hover:text-cream-alt hover:bg-beige/50 dark:hover:bg-dark-surface transition-all duration-200"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <div className="flex items-center gap-1">
              <Link
                href="/profile"
                className="p-2 rounded-full text-warm-gray hover:text-carbon dark:hover:text-cream-alt hover:bg-beige/50 dark:hover:bg-dark-surface transition-all duration-200"
              >
                <User size={18} />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-warm-gray hover:text-carbon dark:hover:text-cream-alt hover:bg-beige/50 dark:hover:bg-dark-surface transition-all duration-200"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-sage hover:bg-sage-light text-white text-sm font-medium transition-colors duration-200"
            >
              <LogIn size={15} />
              <span>Entrar</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
