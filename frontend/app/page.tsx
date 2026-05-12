'use client'

import { useEffect, useRef, useState } from 'react'
import { Sidebar } from '../components/layout/Sidebar'
import { TopBar } from '../components/layout/TopBar'
import { MobileBottomNav } from '../components/layout/MobileBottomNav'
import { SearchBar } from '../components/feed/SearchBar'
import { FilterChips } from '../components/feed/FilterChips'
import { MasonryGrid } from '../components/feed/MasonryGrid'
import { api, type Post, type Tag } from '../lib/api'

const SEED = String(Math.floor(Math.random() * 9999))

export default function FeedPage() {
  const [posts, setPosts]         = useState<Post[]>([])
  const [tags, setTags]           = useState<Tag[]>([])
  const [loading, setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore]     = useState(false)
  const [offset, setOffset]       = useState(0)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [search, setSearch]       = useState('')
  const seedRef                   = useRef(SEED)

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

  useEffect(() => {
    api.tags.getAll()
      .then(setTags)
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchPosts(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTag, search])

  return (
    <div className="flex h-screen overflow-hidden bg-cream dark:bg-dark-bg">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <SearchBar onSearch={setSearch} defaultValue={search} />
        <FilterChips tags={tags} activeTag={activeTag} onTagChange={setActiveTag} />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <SkeletonGrid />
          ) : (
            <MasonryGrid posts={posts} />
          )}

          {hasMore && !loading && (
            <div className="flex justify-center pt-4 pb-8">
              <button
                onClick={() => fetchPosts()}
                disabled={loadingMore}
                className="px-6 py-2 rounded-full border border-beige dark:border-dark-border text-sm text-warm-gray hover:border-sage hover:text-sage dark:hover:border-sage-light dark:hover:text-sage-light transition-colors disabled:opacity-50"
              >
                {loadingMore ? 'Cargando…' : 'Ver más'}
              </button>
            </div>
          )}
        </main>

        <MobileBottomNav />
      </div>
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div className="px-4 py-4" style={{ columns: '2 190px', columnGap: '12px' }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="break-inside-avoid mb-3 rounded-xl bg-linen dark:bg-dark-surface animate-pulse"
          style={{ height: `${180 + (i % 4) * 60}px` }}
        />
      ))}
    </div>
  )
}
