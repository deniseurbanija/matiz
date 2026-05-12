'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, Bookmark, ArrowLeft, User } from 'lucide-react'
import { Header } from '../../../components/layout/Header'
import { api, type Post } from '../../../lib/api'
import { useAuth } from '../../../contexts/AuthContext'

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { user } = useAuth()

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [saved, setSaved] = useState(false)
  const [postId, setPostId] = useState<string | null>(null)

  useEffect(() => {
    params.then(({ id }) => {
      setPostId(id)
      api.posts.getOne(id)
        .then(p => { setPost(p); setLikes(p.likesCount) })
        .catch(() => router.replace('/'))
        .finally(() => setLoading(false))
    })
  }, [params, router])

  const handleLike = async () => {
    if (!user || !postId) return
    try {
      if (liked) {
        await api.posts.unlike(postId)
        setLikes(l => l - 1)
      } else {
        await api.posts.like(postId)
        setLikes(l => l + 1)
      }
      setLiked(l => !l)
    } catch { /* ignore */ }
  }

  const handleSave = async () => {
    if (!user || !postId) return
    try {
      if (saved) {
        await api.posts.unsave(postId)
      } else {
        await api.posts.save(postId)
      }
      setSaved(s => !s)
    } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
          <div className="h-96 rounded-2xl bg-beige/40 dark:bg-dark-surface mb-6" />
          <div className="h-4 bg-beige/40 dark:bg-dark-surface rounded w-2/3 mb-3" />
          <div className="h-4 bg-beige/40 dark:bg-dark-surface rounded w-1/2" />
        </div>
      </div>
    )
  }

  if (!post) return null

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-warm-gray hover:text-carbon dark:hover:text-cream-alt transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        {/* Image */}
        <div className="rounded-2xl overflow-hidden mb-6 shadow-sm">
          <img
            src={post.imageUrl}
            alt={post.caption ?? 'Foto editada'}
            className="w-full h-auto block"
          />
        </div>

        {/* Author + actions */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-beige dark:bg-dark-border flex items-center justify-center text-sm text-warm-gray font-medium uppercase">
              {(post.user?.name ?? 'U')[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-carbon dark:text-cream-alt">
                {post.user?.name ?? 'Usuario'}
              </p>
              <p className="text-xs text-warm-gray">
                {new Date(post.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              disabled={!user}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all ${liked ? 'border-red-300 bg-red-50 dark:bg-red-900/20 text-red-400' : 'border-beige dark:border-dark-border text-warm-gray hover:border-red-300'} disabled:opacity-40`}
            >
              <Heart size={16} className={liked ? 'fill-red-400' : ''} />
              <span className="text-xs">{likes}</span>
            </button>

            <button
              onClick={handleSave}
              disabled={!user}
              className={`p-2 rounded-full border transition-all ${saved ? 'border-sage bg-sage/10 text-sage' : 'border-beige dark:border-dark-border text-warm-gray hover:border-sage'} disabled:opacity-40`}
            >
              <Bookmark size={16} className={saved ? 'fill-sage' : ''} />
            </button>
          </div>
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="text-sm text-carbon dark:text-cream-alt leading-relaxed mb-5">{post.caption}</p>
        )}

        {/* Tool + Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {post.tool && (
            <span className="text-xs bg-sage/10 dark:bg-sage/20 text-sage dark:text-sage-light px-3 py-1 rounded-full border border-sage/20">
              {post.tool.name}
            </span>
          )}
          {post.tags.map(tag => (
            <span key={tag.id} className="text-xs text-warm-gray">
              #{tag.slug}
            </span>
          ))}
        </div>

        {/* Editing config */}
        {post.editingConfig?.settings?.length > 0 && (
          <div className="bg-white dark:bg-dark-surface rounded-2xl border border-beige dark:border-dark-border p-5">
            <h2
              className="text-lg text-carbon dark:text-cream-alt mb-4"
              style={{ fontFamily: 'var(--font-crimson), Georgia, serif' }}
            >
              Configuración de edición
            </h2>
            <ul className="flex flex-col gap-2.5">
              {post.editingConfig.settings.map((s, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-warm-gray">{s.label}</span>
                  <span className="font-medium text-carbon dark:text-cream-alt tabular-nums">{s.value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}
