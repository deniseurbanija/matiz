'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, Bookmark, ArrowLeft, MoreVertical, Pencil, Archive, Trash2 } from 'lucide-react'
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

  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    params.then(({ id }) => {
      setPostId(id)
      api.posts.getOne(id)
        .then(p => { setPost(p); setLikes(p.likesCount) })
        .catch(() => router.replace('/'))
        .finally(() => setLoading(false))
    })
  }, [params, router])

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setConfirmDelete(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

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

  const handleArchive = async () => {
    if (!postId) return
    setActionLoading(true)
    setMenuOpen(false)
    try {
      const updated = await api.posts.archive(postId)
      setPost(updated)
    } catch { /* ignore */ }
    finally { setActionLoading(false) }
  }

  const handleDelete = async () => {
    if (!postId) return
    setActionLoading(true)
    try {
      await api.posts.delete(postId)
      router.replace('/profile')
    } catch {
      setActionLoading(false)
      setConfirmDelete(false)
      setMenuOpen(false)
    }
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

  const isOwner = user?.id === post.userId

  // Normalize editingConfig defensively (handles string or object from backend)
  const rawConfig = post.editingConfig as unknown
  const configObj = typeof rawConfig === 'string'
    ? (() => { try { return JSON.parse(rawConfig) } catch { return null } })()
    : rawConfig
  const configSettings: { label: string; value: string }[] = configObj?.settings ?? []

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

        {/* Archived badge */}
        {post.isArchived && (
          <div className="mb-4 px-3 py-1.5 rounded-lg bg-warm-gray/10 border border-warm-gray/20 text-xs text-warm-gray inline-flex items-center gap-1.5">
            <Archive size={13} />
            Publicación archivada · no aparece en el feed
          </div>
        )}

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
            {/* Like / Save — only for non-owners */}
            {!isOwner && (
              <>
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
              </>
            )}

            {/* Owner likes counter (read-only) + menu */}
            {isOwner && (
              <>
                <span className="flex items-center gap-1 text-xs text-warm-gray px-3 py-2 rounded-full border border-beige dark:border-dark-border">
                  <Heart size={14} />
                  {likes}
                </span>

                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => { setMenuOpen(o => !o); setConfirmDelete(false) }}
                    disabled={actionLoading}
                    className="p-2 rounded-full border border-beige dark:border-dark-border text-warm-gray hover:border-sage hover:text-sage transition-colors disabled:opacity-40"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-dark-surface rounded-xl border border-beige dark:border-dark-border shadow-lg overflow-hidden z-50">
                      <Link
                        href={`/posts/${postId}/edit`}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-carbon dark:text-cream-alt hover:bg-beige/50 dark:hover:bg-dark-border/30 transition-colors"
                      >
                        <Pencil size={14} className="text-warm-gray" />
                        Editar
                      </Link>

                      <button
                        onClick={handleArchive}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-carbon dark:text-cream-alt hover:bg-beige/50 dark:hover:bg-dark-border/30 transition-colors"
                      >
                        <Archive size={14} className="text-warm-gray" />
                        {post.isArchived ? 'Desarchivar' : 'Archivar'}
                      </button>

                      <div className="border-t border-beige dark:border-dark-border" />

                      {!confirmDelete ? (
                        <button
                          onClick={() => setConfirmDelete(true)}
                          className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 size={14} />
                          Eliminar
                        </button>
                      ) : (
                        <div className="px-4 py-3">
                          <p className="text-xs text-warm-gray mb-2">¿Confirmar eliminación?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={handleDelete}
                              className="flex-1 py-1.5 rounded-lg bg-red-400 text-white text-xs font-medium hover:bg-red-500 transition-colors"
                            >
                              Eliminar
                            </button>
                            <button
                              onClick={() => setConfirmDelete(false)}
                              className="flex-1 py-1.5 rounded-lg border border-beige dark:border-dark-border text-xs text-warm-gray hover:border-sage transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
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
        {configSettings.length > 0 && (
          <div className="bg-white dark:bg-dark-surface rounded-2xl border border-beige dark:border-dark-border p-5">
            <h2
              className="text-lg text-carbon dark:text-cream-alt mb-4"
              style={{ fontFamily: 'var(--font-crimson), Georgia, serif' }}
            >
              Configuración de edición
            </h2>
            <ul className="flex flex-col gap-2.5">
              {configSettings.map((s, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-warm-gray">{s.label}</span>
                  <span className="font-medium text-carbon dark:text-cream-alt tabular-nums">{s.value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {configSettings.length === 0 && (
          <div className="bg-white dark:bg-dark-surface rounded-2xl border border-beige dark:border-dark-border p-5">
            <p className="text-sm text-warm-gray text-center">Sin configuración de edición cargada</p>
          </div>
        )}
      </main>
    </div>
  )
}
