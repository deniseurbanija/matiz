'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImagePlus, Plus, Trash2, X } from 'lucide-react'
import { Header } from '../../components/layout/Header'
import { api, type Tag, type Tool } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

interface Setting {
  label: string
  value: string
}

export default function UploadPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [tags, setTags] = useState<Tag[]>([])
  const [tools, setTools] = useState<Tool[]>([])

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [toolId, setToolId] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [settings, setSettings] = useState<Setting[]>([{ label: '', value: '' }])
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    Promise.all([api.tags.getAll(), api.tools.getAll()])
      .then(([t, tl]) => { setTags(t); setTools(tl) })
      .catch(() => {})
  }, [])

  const handleFile = (file: File) => {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) handleFile(file)
  }

  const addSetting = () => setSettings(s => [...s, { label: '', value: '' }])

  const updateSetting = (i: number, field: keyof Setting, val: string) =>
    setSettings(s => s.map((item, idx) => idx === i ? { ...item, [field]: val } : item))

  const removeSetting = (i: number) =>
    setSettings(s => s.filter((_, idx) => idx !== i))

  const toggleTag = (id: string) =>
    setSelectedTags(t => t.includes(id) ? t.filter(x => x !== id) : [...t, id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile) return setError('Seleccioná una imagen')
    if (!toolId) return setError('Elegí una herramienta de edición')

    const validSettings = settings.filter(s => s.label.trim() && s.value.trim())
    if (validSettings.length === 0) return setError('Agregá al menos un ajuste de edición')

    setError(null)
    setLoading(true)

    try {
      const form = new FormData()
      form.append('image', imageFile)
      if (caption) form.append('caption', caption)
      form.append('toolId', toolId)
      form.append('editingConfig', JSON.stringify({ settings: validSettings }))
      form.append('tagIds', JSON.stringify(selectedTags))

      const post = await api.posts.create(form)
      router.push(`/posts/${post.id}`)
    } catch (err: any) {
      setError(err.message ?? 'Error al subir el post')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return null

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1
          className="text-3xl text-carbon dark:text-cream-alt mb-8"
          style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontWeight: 300 }}
        >
          Compartir edición
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Image dropzone */}
          <div>
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-96 object-cover" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null) }}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl h-52 flex flex-col items-center justify-center cursor-pointer transition-colors ${dragging ? 'border-sage bg-sage/5' : 'border-beige dark:border-dark-border hover:border-sage dark:hover:border-sage-light'}`}
              >
                <ImagePlus size={32} className="text-warm-gray mb-2" />
                <p className="text-sm text-warm-gray text-center px-4">
                  Arrastrá tu foto o{' '}
                  <span className="text-sage dark:text-sage-light">seleccioná desde el dispositivo</span>
                </p>
                <p className="text-xs text-warm-gray/60 mt-1">JPG, PNG, WEBP · Máx. 10MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </div>
            )}
          </div>

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
            <label className="text-xs text-warm-gray">Herramienta de edición *</label>
            <select
              value={toolId}
              onChange={e => setToolId(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-dark-surface border border-beige dark:border-dark-border text-sm text-carbon dark:text-cream-alt focus:outline-none focus:border-sage dark:focus:border-sage-light transition-colors appearance-none cursor-pointer"
            >
              <option value="">Elegí una app…</option>
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

          <button
            type="submit"
            disabled={loading || !imageFile}
            className="py-3 rounded-xl bg-sage hover:bg-sage-light text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Subiendo…' : 'Publicar'}
          </button>
        </form>
      </main>
    </div>
  )
}
