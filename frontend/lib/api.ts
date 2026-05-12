export interface Tag {
  id: string
  name: string
  slug: string
}

export interface Tool {
  id: string
  name: string
  slug: string
  defaultFields: string[]
}

export interface EditingSetting {
  label: string
  value: string
}

export interface Post {
  id: string
  imageUrl: string
  caption: string | null
  editingConfig: { settings: EditingSetting[] }
  isArchived: boolean
  likesCount: number
  savesCount: number
  userId: string
  toolId: string | null
  tool: Tool | null
  tags: Tag[]
  user: { id: string; name: string | null; avatar: string | null }
  createdAt: string
}

export interface UserProfile {
  id: string
  name: string | null
  avatar: string | null
  createdAt: string
}

export interface PostsResponse {
  data: Post[]
  total: number
  nextOffset: number
  hasMore: boolean
}

export interface FeedQuery {
  seed?: string
  offset?: string
  limit?: string
  tag?: string
  toolId?: string
  q?: string
}

const BASE = '/api'

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      ...(!(init?.body instanceof FormData) && { 'Content-Type': 'application/json' }),
      ...init?.headers,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message ?? `Error ${res.status}`)
  }

  const text = await res.text()
  return text ? JSON.parse(text) : (undefined as T)
}

export const api = {
  auth: {
    me: () => req<{ id: string; email: string; name: string | null; avatar: string | null; createdAt: string }>('/auth/me'),
    login: (email: string, password: string) =>
      req('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (email: string, password: string, name?: string) =>
      req('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
    logout: () => req('/auth/logout', { method: 'POST' }),
    googleLogin: () => { window.location.href = '/api/auth/google' },
  },

  posts: {
    getAll: (query: FeedQuery = {}) => {
      const params = new URLSearchParams(query as Record<string, string>)
      return req<PostsResponse>(`/posts?${params}`)
    },
    getOne: (id: string) => req<Post>(`/posts/${id}`),
    create: (data: FormData) =>
      fetch(`${BASE}/posts`, { method: 'POST', credentials: 'include', body: data }).then(r => r.json()),
    update: (id: string, data: { caption?: string; editingConfig?: { settings: EditingSetting[] }; toolId?: string; tagIds?: string[] }) =>
      req<Post>(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    archive: (id: string) => req<Post>(`/posts/${id}/archive`, { method: 'PATCH' }),
    delete: (id: string) => req(`/posts/${id}`, { method: 'DELETE' }),
    like: (id: string) => req(`/posts/${id}/like`, { method: 'POST' }),
    unlike: (id: string) => req(`/posts/${id}/like`, { method: 'DELETE' }),
    save: (id: string, collectionId?: string) =>
      req(`/posts/${id}/save`, { method: 'POST', body: JSON.stringify({ collectionId }) }),
    unsave: (id: string) => req(`/posts/${id}/save`, { method: 'DELETE' }),
  },

  tags: {
    getAll: () => req<Tag[]>('/tags'),
  },

  tools: {
    getAll: () => req<Tool[]>('/tools'),
  },

  users: {
    getProfile: (id: string) => req<UserProfile>(`/users/${id}`),
    getPosts: (id: string) => req<Post[]>(`/users/${id}/posts`),
    getSaved: () => req<Post[]>('/users/me/saved'),
    updateMe: (data: { name?: string }) =>
      req<UserProfile>('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
  },
}
