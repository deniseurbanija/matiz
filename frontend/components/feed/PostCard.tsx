'use client'

import Link from 'next/link'
import { Heart, Bookmark } from 'lucide-react'
import { useState } from 'react'
import type { Post } from '../../lib/api'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
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
      <article className="group relative rounded-2xl overflow-hidden bg-white dark:bg-dark-surface shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer">
        {/* Image */}
        <div className="relative overflow-hidden">
          <img
            src={post.imageUrl}
            alt={post.caption ?? 'Foto editada'}
            className="w-full h-auto block object-cover group-hover:scale-[1.02] transition-transform duration-500"
            loading="lazy"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Like button — visible on hover */}
          <button
            onClick={handleLike}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-dark-surface/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          >
            <Heart
              size={16}
              className={liked ? 'fill-red-400 text-red-400' : 'text-warm-gray'}
            />
          </button>
        </div>

        {/* Footer */}
        <div className="px-3 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Avatar placeholder */}
            <div className="w-6 h-6 rounded-full bg-beige dark:bg-dark-border shrink-0 flex items-center justify-center text-[10px] text-warm-gray font-medium uppercase">
              {(post.user?.name ?? post.user?.id ?? 'U')[0]}
            </div>
            <span className="text-xs text-warm-gray truncate">
              {post.user?.name ?? 'Usuario'}
            </span>
          </div>

          {post.tool && (
            <span className="text-[10px] text-warm-gray bg-cream dark:bg-dark-bg px-2 py-0.5 rounded-full shrink-0 border border-beige dark:border-dark-border">
              {post.tool.name}
            </span>
          )}
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="px-3 pb-2.5 flex flex-wrap gap-1">
            {post.tags.slice(0, 2).map(tag => (
              <span
                key={tag.id}
                className="text-[10px] text-sage dark:text-sage-light"
              >
                #{tag.slug}
              </span>
            ))}
          </div>
        )}
      </article>
    </Link>
  )
}
