import type { Post } from '../../lib/api'
import { PostCard } from './PostCard'

interface MasonryGridProps {
  posts: Post[]
}

export function MasonryGrid({ posts }: MasonryGridProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <p
          className="text-4xl text-carbon/30 dark:text-cream-alt/30 mb-3"
          style={{ fontFamily: 'var(--font-crimson), Georgia, serif' }}
        >
          Todavía no hay fotos
        </p>
        <p className="text-sm text-warm-gray">
          Sé el primero en compartir tu edición
        </p>
      </div>
    )
  }

  return (
    <div
      className="px-2 sm:px-4"
      style={{
        columns: '2 160px',
        columnGap: '10px',
      }}
    >
      {posts.map(post => (
        <div
          key={post.id}
          className="break-inside-avoid mb-2.5 sm:mb-3"
        >
          <PostCard post={post} />
        </div>
      ))}
    </div>
  )
}
