import type { Post } from '../../lib/api'
import { PostCard } from './PostCard'

const serif = { fontFamily: 'var(--font-crimson), Georgia, serif' }

export function MasonryGrid({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <p
          className="text-4xl text-carbon/30 dark:text-cream-alt/30 mb-2"
          style={serif}
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
      className="px-4 py-4"
      style={{ columns: '3 130px', columnGap: '10px' }}
    >
      {posts.map(post => (
        <div key={post.id} className="break-inside-avoid mb-3">
          <PostCard post={post} />
        </div>
      ))}
    </div>
  )
}
