import { perform, request } from './helpers'

export interface BoardSummary {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export interface Board extends BoardSummary {
  boardData: { elements: unknown[] }
}

export const api = {
  boards: {
    list: (params?: { search?: string }) => {
      const qs = new URLSearchParams()

      if (params?.search) qs.set('search', params.search)

      return perform<BoardSummary[]>(`/boards?${qs}`)
    },
    get: (id: number) => perform<Board>(`/boards/${id}`),
    create: (data?: { name?: string; boardData?: unknown }) => perform<Board>('/boards', request('POST', data ?? {})),
    update: (id: number, data: { name?: string; boardData?: unknown }) => perform<Board>(`/boards/${id}`, request('PUT', data)),
    delete: (id: number) => perform<void>(`/boards/${id}`, { method: 'DELETE' }),
  },
}
