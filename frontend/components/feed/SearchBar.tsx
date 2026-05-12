'use client'

import { Search } from 'lucide-react'

interface SearchBarProps {
  defaultValue?: string
  onSearch: (q: string) => void
}

export function SearchBar({ defaultValue = '', onSearch }: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value
    onSearch(q)
  }

  return (
    <div className="flex w-full items-start px-4 md:px-6 py-2">
      <form onSubmit={handleSubmit} className="flex-1">
        <div className="flex items-center gap-2.5 rounded-full bg-search-bg dark:bg-dark-surface px-4 py-2.5">
          <Search size={15} className="text-sage-mid dark:text-sage-light shrink-0" strokeWidth={1.8} />
          <input
            name="q"
            defaultValue={defaultValue}
            placeholder="Buscar presets, estilos, fotógrafos…"
            className="flex-1 bg-transparent text-[13.5px] text-carbon dark:text-cream-alt placeholder-warm-gray/60 focus:outline-none"
          />
        </div>
      </form>
    </div>
  )
}
