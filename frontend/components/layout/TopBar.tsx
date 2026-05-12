'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const serif = { fontFamily: 'var(--font-crimson), Georgia, serif' }

export function TopBar() {
  const { user } = useAuth()

  const initial = user
    ? (user.name ?? user.email ?? 'U')[0].toUpperCase()
    : 'U'

  return (
    <div className="flex w-full items-center gap-3 px-4 md:px-6 py-3">
      {/* Brand name */}
      <div className="flex-1">
        <span
          className="text-2xl text-sage dark:text-sage-light select-none"
          style={serif}
        >
          Matiz
        </span>
      </div>

      {/* Bell */}
      <button
        aria-label="Notificaciones"
        className="p-2 rounded-full text-warm-gray hover:text-carbon dark:hover:text-cream-alt hover:bg-linen dark:hover:bg-dark-surface transition-colors duration-200"
      >
        <Bell size={18} strokeWidth={1.6} />
      </button>

      {/* Avatar */}
      <Link href="/profile" aria-label="Perfil">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name ?? 'Avatar'}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-beige dark:ring-dark-border"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full bg-sage/20 dark:bg-sage/30 flex items-center justify-center text-sage text-sm select-none"
            style={serif}
          >
            {initial}
          </div>
        )}
      </Link>
    </div>
  )
}
