import { perform, performBlob, request } from './helpers'

export interface BoardSummary {
  id: number
  name: string
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export interface BoardData {
  elements: unknown[]
  appState?: Record<string, unknown>
  files?: Record<string, unknown>
}

export interface Board extends BoardSummary {
  boardData: BoardData
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
    pin: (id: number, pinned: boolean) => perform<Board>(`/boards/${id}/pin`, request('PUT', { pinned })),
    delete: (id: number) => perform<void>(`/boards/${id}`, { method: 'DELETE' }),
    deleteAll: () => perform<void>('/boards', { method: 'DELETE' }),
    exportAll: () => performBlob('/boards/export'),
    import: (files: { name: string; contents: string }[]) => perform<BoardSummary[]>('/boards/import', request('POST', { files })),
  },
}
