'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useState } from 'react'
import type { Post } from '../../lib/api'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

const serif = { fontFamily: 'var(--font-crimson), Georgia, serif' }

export function PostCard({ post }: { post: Post }) {
  const { user } = useAuth()
  const [likes, setLikes] = useState(post.likesCount)
  const [liked, setLiked] = useState(false)

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) return
    try {
      if (liked) {
        await api.posts.unlike(post.id)
        setLikes(l => l - 1)
      } else {
        await api.posts.like(post.id)
        setLikes(l => l + 1)
      }
      setLiked(l => !l)
    } catch {
      // ignore
    }
  }

  return (
    <Link href={`/posts/${post.id}`}>
      <article className="group flex flex-col overflow-hidden rounded-xl bg-white dark:bg-dark-surface cursor-pointer hover:shadow-[0_4px_20px_rgba(92,107,79,0.14)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-shadow duration-300">

        {/* Image */}
        <div className="relative overflow-hidden">
          <img
            src={post.imageUrl}
            alt={post.caption ?? 'Foto editada'}
            className="w-full h-auto block object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
            loading="lazy"
          />
          <button
            onClick={handleLike}
            aria-label={liked ? 'Quitar me gusta' : 'Me gusta'}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 dark:bg-dark-surface/90 backdrop-blur-sm opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
          >
            <Heart
              size={13}
              className={liked ? 'fill-rose-400 text-rose-400' : 'text-warm-gray'}
            />
          </button>
        </div>

        {/* Caption + meta */}
        <div className="flex flex-col gap-1 px-3 py-2.5">
          {post.caption && (
            <span
              className="text-[13px] leading-snug text-carbon dark:text-cream-alt line-clamp-2 font-medium"
              style={{ ...serif, fontStyle: 'italic' }}
            >
              {post.caption}
            </span>
          )}

          <div className="flex items-center gap-1.5 flex-wrap">
            {post.tool && (
              <span
                className="text-[10px] bg-linen dark:bg-dark-bg text-carbon dark:text-cream-alt/70 px-2 py-0.5 rounded-full border border-beige dark:border-dark-border"
              >
                {post.tool.name}
              </span>
            )}
            <span
              className="text-[11px] text-sage-mid dark:text-sage-light"
              style={serif}
            >
              @{post.user?.name ?? 'usuario'}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
