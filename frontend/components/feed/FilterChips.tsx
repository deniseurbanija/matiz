'use client'

import type { Tag } from '../../lib/api'

interface FilterChipsProps {
  tags: Tag[]
  activeTag: string | null
  onTagChange: (slug: string | null) => void
}

const serif = { fontFamily: 'var(--font-crimson), Georgia, serif' }

export function FilterChips({ tags, activeTag, onTagChange }: FilterChipsProps) {
  return (
    <div className="flex w-full items-center gap-2 border-b border-beige dark:border-dark-border px-4 md:px-6 py-3 overflow-x-auto scrollbar-none">
      <Chip active={!activeTag} onClick={() => onTagChange(null)}>
        Todo
      </Chip>
      {tags.map(tag => (
        <Chip
          key={tag.id}
          active={activeTag === tag.slug}
          onClick={() => onTagChange(activeTag === tag.slug ? null : tag.slug)}
        >
          {tag.name}
        </Chip>
      ))}
    </div>
  )
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
        active
          ? 'bg-sage text-white'
          : 'bg-linen dark:bg-dark-surface text-sage dark:text-sage-light hover:bg-beige dark:hover:bg-dark-border'
      }`}
      style={serif}
    >
      {children}
    </button>
  )
}
