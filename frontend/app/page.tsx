'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { MasonryGrid } from '../components/feed/MasonryGrid'
import { api, type Post, type Tag, type Tool } from '../lib/api'

const SEED = String(Math.floor(Math.random() * 9999))

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)

  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const seedRef = useRef(SEED)

  const fetchPosts = async (reset = false) => {
    const nextOffset = reset ? 0 : offset
    if (reset) setLoading(true)
    else setLoadingMore(true)

    try {
      const res = await api.posts.getAll({
        seed: seedRef.current,
        offset: String(nextOffset),
        limit: '20',
        ...(activeTag && { tag: activeTag }),
        ...(activeTool && { toolId: activeTool }),
        ...(search && { q: search }),
      })

      setPosts(prev => (reset ? res.data : [...prev, ...res.data]))
      setHasMore(res.hasMore)
      setOffset(res.nextOffset)
    } catch {
      // ignore
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Load tags and tools once
  useEffect(() => {
    Promise.all([api.tags.getAll(), api.tools.getAll()])
      .then(([t, tl]) => { setTags(t); setTools(tl) })
      .catch(() => {})
  }, [])

  // Refetch when filters change
  useEffect(() => {
    fetchPosts(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTag, activeTool, search])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value
    setSearch(q)
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto pb-16">
        {/* Search + filters bar */}
        <div className="sticky top-14 sm:top-16 z-40 bg-cream/90 dark:bg-dark-bg/90 backdrop-blur-md border-b border-beige dark:border-dark-border px-4 py-3 flex flex-col gap-3">
          {/* Search row */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray pointer-events-none" />
              <input
                name="q"
                placeholder="Buscar por descripción…"
                defaultValue={search}
                className="w-full pl-9 pr-4 py-2 rounded-full bg-white dark:bg-dark-surface border border-beige dark:border-dark-border text-sm text-carbon dark:text-cream-alt placeholder-warm-gray focus:outline-none focus:border-sage dark:focus:border-sage-light transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(f => !f)}
              className={`p-2 rounded-full border transition-colors ${showFilters ? 'bg-sage text-white border-sage' : 'border-beige dark:border-dark-border text-warm-gray hover:border-sage dark:hover:border-sage-light'}`}
            >
              <SlidersHorizontal size={16} />
            </button>
          </form>

          {/* Tag chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTag(null)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${!activeTag ? 'bg-sage text-white' : 'bg-white dark:bg-dark-surface border border-beige dark:border-dark-border text-warm-gray hover:border-sage'}`}
            >
              Todo
            </button>
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => setActiveTag(activeTag === tag.slug ? null : tag.slug)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${activeTag === tag.slug ? 'bg-sage text-white' : 'bg-white dark:bg-dark-surface border border-beige dark:border-dark-border text-warm-gray hover:border-sage'}`}
              >
                {tag.name}
              </button>
            ))}
          </div>

          {/* Tool filter — only shown when filters open */}
          {showFilters && tools.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs text-warm-gray shrink-0 self-center">App:</span>
              <button
                onClick={() => setActiveTool(null)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${!activeTool ? 'bg-carbon dark:bg-cream-alt text-white dark:text-carbon' : 'bg-white dark:bg-dark-surface border border-beige dark:border-dark-border text-warm-gray hover:border-sage'}`}
              >
                Todas
              </button>
              {tools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${activeTool === tool.id ? 'bg-carbon dark:bg-cream-alt text-white dark:text-carbon' : 'bg-white dark:bg-dark-surface border border-beige dark:border-dark-border text-warm-gray hover:border-sage'}`}
                >
                  {tool.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="pt-4">
          {loading ? (
            <SkeletonGrid />
          ) : (
            <MasonryGrid posts={posts} />
          )}
        </div>

        {/* Load more */}
        {hasMore && !loading && (
          <div className="flex justify-center pt-8 pb-4">
            <button
              onClick={() => fetchPosts()}
              disabled={loadingMore}
              className="px-6 py-2.5 rounded-full border border-beige dark:border-dark-border text-sm text-warm-gray hover:border-sage hover:text-sage dark:hover:border-sage-light dark:hover:text-sage-light transition-colors disabled:opacity-50"
            >
              {loadingMore ? 'Cargando…' : 'Ver más'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div className="px-2 sm:px-4" style={{ columns: '2 160px', columnGap: '10px' }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="break-inside-avoid mb-2.5 sm:mb-3 rounded-2xl bg-beige/40 dark:bg-dark-surface animate-pulse"
          style={{ height: `${180 + (i % 4) * 60}px` }}
        />
      ))}
    </div>
  )
}
