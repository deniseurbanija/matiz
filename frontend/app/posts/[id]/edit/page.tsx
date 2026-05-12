'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, X } from 'lucide-react'
import { Header } from '../../../../components/layout/Header'
import { api, type Tag, type Tool } from '../../../../lib/api'
import { useAuth } from '../../../../contexts/AuthContext'

interface Setting {
  label: string
  value: string
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [postId, setPostId] = useState<string | null>(null)
  const [tags, setTags] = useState<Tag[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const [caption, setCaption] = useState('')
  const [toolId, setToolId] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [settings, setSettings] = useState<Setting[]>([{ label: '', value: '' }])

  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initialized = useRef(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/login'); return }
    if (initialized.current) return
    initialized.current = true

    params.then(({ id }) => {
      setPostId(id)
      Promise.all([api.posts.getOne(id), api.tags.getAll(), api.tools.getAll()])
        .then(([post, t, tl]) => {
          if (post.userId !== user.id) { router.replace('/'); return }

          setTags(t)
          setTools(tl)
          setImageUrl(post.imageUrl)
          setCaption(post.caption ?? '')
          setToolId(post.toolId ?? '')
          setSelectedTags(post.tags.map(tag => tag.id))

          const rawConfig = post.editingConfig as unknown
          const configObj = typeof rawConfig === 'string'
            ? (() => { try { return JSON.parse(rawConfig) } catch { return null } })()
            : rawConfig
          const existing: Setting[] = configObj?.settings ?? []
          setSettings(existing.length ? existing : [{ label: '', value: '' }])
        })
        .catch(() => router.replace('/'))
        .finally(() => setLoadingData(false))
    })
  }, [authLoading, user, params, router])

  const addSetting = () => setSettings(s => [...s, { label: '', value: '' }])

  const updateSetting = (i: number, field: keyof Setting, val: string) =>
    setSettings(s => s.map((item, idx) => idx === i ? { ...item, [field]: val } : item))

  const removeSetting = (i: number) =>
    setSettings(s => s.filter((_, idx) => idx !== i))

  const toggleTag = (id: string) =>
    setSelectedTags(t => t.includes(id) ? t.filter(x => x !== id) : [...t, id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!postId) return

    const validSettings = settings.filter(s => s.label.trim() && s.value.trim())
    if (validSettings.length === 0) return setError('Agregá al menos un ajuste de edición')

    setError(null)
    setSaving(true)

    try {
      await api.posts.update(postId, {
        caption: caption || undefined,
        toolId: toolId || undefined,
        editingConfig: { settings: validSettings },
        tagIds: selectedTags,
      })
      router.push(`/posts/${postId}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse space-y-4">
          <div className="h-64 rounded-2xl bg-beige/40 dark:bg-dark-surface" />
          <div className="h-10 rounded-xl bg-beige/40 dark:bg-dark-surface" />
          <div className="h-10 rounded-xl bg-beige/40 dark:bg-dark-surface" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1
            className="text-3xl text-carbon dark:text-cream-alt"
            style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontWeight: 300 }}
          >
            Editar publicación
          </h1>
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-full text-warm-gray hover:text-carbon dark:hover:text-cream-alt hover:bg-beige/50 dark:hover:bg-dark-surface transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Current image (read-only) */}
          {imageUrl && (
            <div className="rounded-2xl overflow-hidden shadow-sm">
              <img src={imageUrl} alt="Imagen actual" className="w-full h-auto max-h-80 object-cover block" />
            </div>
          )}

          {/* Caption */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-warm-gray">Descripción (opcional)</label>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              rows={3}
              placeholder="Contá algo sobre esta foto o cómo la editaste…"
              className="px-4 py-3 rounded-xl bg-white dark:bg-dark-surface border border-beige dark:border-dark-border text-sm text-carbon dark:text-cream-alt placeholder-warm-gray focus:outline-none focus:border-sage dark:focus:border-sage-light transition-colors resize-none"
            />
          </div>

          {/* Tool */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-warm-gray">Herramienta de edición</label>
            <select
              value={toolId}
              onChange={e => setToolId(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-dark-surface border border-beige dark:border-dark-border text-sm text-carbon dark:text-cream-alt focus:outline-none focus:border-sage dark:focus:border-sage-light transition-colors appearance-none cursor-pointer"
            >
              <option value="">Sin herramienta</option>
              {tools.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-xs text-warm-gray">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedTags.includes(tag.id) ? 'bg-sage text-white' : 'bg-white dark:bg-dark-surface border border-beige dark:border-dark-border text-warm-gray hover:border-sage'}`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Editing config */}
          <div className="flex flex-col gap-3">
            <label className="text-xs text-warm-gray">Configuración de edición *</label>
            <div className="flex flex-col gap-2">
              {settings.map((s, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    value={s.label}
                    onChange={e => updateSetting(i, 'label', e.target.value)}
                    placeholder="Ajuste (ej. Exposición)"
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-dark-surface border border-beige dark:border-dark-border text-sm text-carbon dark:text-cream-alt placeholder-warm-gray focus:outline-none focus:border-sage dark:focus:border-sage-light transition-colors"
                  />
                  <input
                    value={s.value}
                    onChange={e => updateSetting(i, 'value', e.target.value)}
                    placeholder="Valor (ej. -20)"
                    className="w-28 px-3 py-2 rounded-xl bg-white dark:bg-dark-surface border border-beige dark:border-dark-border text-sm text-carbon dark:text-cream-alt placeholder-warm-gray focus:outline-none focus:border-sage dark:focus:border-sage-light transition-colors"
                  />
                  {settings.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSetting(i)}
                      className="p-2 text-warm-gray hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addSetting}
              className="flex items-center gap-1.5 text-xs text-sage dark:text-sage-light hover:underline self-start"
            >
              <Plus size={14} /> Agregar ajuste
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 rounded-xl border border-beige dark:border-dark-border text-sm text-warm-gray hover:border-sage dark:hover:border-sage-light transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-sage hover:bg-sage-light text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
