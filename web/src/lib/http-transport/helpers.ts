const BASE_API_ENDPOINT = '/api/v1'

export const request = (method: string, payload: unknown, overrides?: RequestInit): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
  ...overrides,
})

export const perform = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${BASE_API_ENDPOINT}${endpoint}`, options)

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }))
    const error = new Error(body.error ?? 'Request failed') as Error & { code: number }

    error.code = response.status

    throw error
  }

  if (response.status === 204) return undefined as T // 204 No Content

  return response.json()
}
