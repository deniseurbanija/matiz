'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Upload, Pencil, Check, X } from 'lucide-react'
import { Header } from '../../components/layout/Header'
import { MasonryGrid } from '../../components/feed/MasonryGrid'
import { api, type Post } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

type Tab = 'posts' | 'saved'

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading, setUser } = useAuth()

  const [posts, setPosts] = useState<Post[]>([])
  const [saved, setSaved] = useState<Post[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('posts')
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [loadingSaved, setLoadingSaved] = useState(false)
  const [savedFetched, setSavedFetched] = useState(false)

  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [savingName, setSavingName] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    api.users.getPosts(user.id)
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoadingPosts(false))
  }, [user])

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    if (tab === 'saved' && !savedFetched) {
      setLoadingSaved(true)
      api.users.getSaved()
        .then(data => { setSaved(data); setSavedFetched(true) })
        .catch(() => {})
        .finally(() => setLoadingSaved(false))
    }
  }

  const startEditName = () => {
    setNameInput(user?.name ?? '')
    setEditingName(true)
  }

  const cancelEditName = () => {
    setEditingName(false)
    setNameInput('')
  }

  const saveName = async () => {
    if (!nameInput.trim()) return
    setSavingName(true)
    try {
      const updated = await api.users.updateMe({ name: nameInput.trim() })
      setUser({ ...user!, name: updated.name })
      setEditingName(false)
    } catch { /* ignore */ }
    finally { setSavingName(false) }
  }

  if (authLoading || !user) return null

  const joinDate = new Date(user.createdAt).toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  })

  const isLoading = activeTab === 'posts' ? loadingPosts : loadingSaved
  const activePosts = activeTab === 'posts' ? posts : saved

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile card */}
        <div className="flex items-center gap-5 mb-10">
          <div className="w-16 h-16 rounded-full bg-sage flex items-center justify-center text-2xl text-white font-medium uppercase shrink-0 select-none">
            {(user.name ?? user.email)[0]}
          </div>

          <div className="min-w-0 flex-1">
            {editingName ? (
              <div className="flex items-center gap-2 mb-1">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') cancelEditName() }}
                  maxLength={80}
                  className="flex-1 min-w-0 px-3 py-1.5 rounded-lg bg-white dark:bg-dark-surface border border-sage dark:border-sage text-sm text-carbon dark:text-cream-alt focus:outline-none"
                  style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: '1.2rem' }}
                />
                <button
                  onClick={saveName}
                  disabled={savingName || !nameInput.trim()}
                  className="p-1.5 rounded-full bg-sage text-white hover:bg-sage-light transition-colors disabled:opacity-40"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={cancelEditName}
                  className="p-1.5 rounded-full border border-beige dark:border-dark-border text-warm-gray hover:border-sage transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-0.5">
                <h1
                  className="text-2xl text-carbon dark:text-cream-alt truncate"
                  style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontWeight: 300 }}
                >
                  {user.name ?? 'Sin nombre'}
                </h1>
                <button
                  onClick={startEditName}
                  className="p-1.5 rounded-full text-warm-gray hover:text-sage dark:hover:text-sage-light hover:bg-beige/50 dark:hover:bg-dark-surface transition-colors shrink-0"
                >
                  <Pencil size={13} />
                </button>
              </div>
            )}
            <p className="text-sm text-warm-gray truncate">{user.email}</p>
            <p className="text-xs text-warm-gray/60 mt-0.5">Miembro desde {joinDate}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-beige dark:border-dark-border mb-6">
          <TabButton
            active={activeTab === 'posts'}
            onClick={() => handleTabChange('posts')}
            label="Publicaciones"
            count={posts.length}
          />
          <TabButton
            active={activeTab === 'saved'}
            onClick={() => handleTabChange('saved')}
            label="Guardados"
            count={savedFetched ? saved.length : undefined}
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <SkeletonGrid />
        ) : activePosts.length > 0 ? (
          <MasonryGrid posts={activePosts} />
        ) : (
          <EmptyState tab={activeTab} />
        )}
      </main>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number | undefined
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active
          ? 'border-sage text-sage dark:text-sage-light'
          : 'border-transparent text-warm-gray hover:text-carbon dark:hover:text-cream-alt'
      }`}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className="ml-1.5 text-xs opacity-50">{count}</span>
      )}
    </button>
  )
}

function EmptyState({ tab }: { tab: Tab }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <p
        className="text-3xl text-carbon/30 dark:text-cream-alt/30 mb-3"
        style={{ fontFamily: 'var(--font-crimson), Georgia, serif' }}
      >
        {tab === 'posts' ? 'Todavía no subiste nada' : 'Todavía no guardaste nada'}
      </p>
      {tab === 'posts' && (
        <Link
          href="/upload"
          className="flex items-center gap-1.5 mt-2 text-sm text-sage dark:text-sage-light hover:underline"
        >
          <Upload size={14} />
          Compartir tu primera edición
        </Link>
      )}
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div className="px-2 sm:px-4" style={{ columns: '2 160px', columnGap: '10px' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="break-inside-avoid mb-2.5 sm:mb-3 rounded-2xl bg-beige/40 dark:bg-dark-surface animate-pulse"
          style={{ height: `${180 + (i % 3) * 60}px` }}
        />
      ))}
    </div>
  )
}
