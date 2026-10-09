const BASE_API_ENDPOINT = '/api/v1'

export const request = (method: string, payload: unknown, overrides?: RequestInit): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
  ...overrides,
})

const performRaw = async (endpoint: string, options?: RequestInit): Promise<Response> => {
  const response = await fetch(`${BASE_API_ENDPOINT}${endpoint}`, options)

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }))
    const error = new Error(body.error ?? 'Request failed') as Error & { code: number }

    error.code = response.status

    throw error
  }

  return response
}

export const perform = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const response = await performRaw(endpoint, options)

  if (response.status === 204) return undefined as T // 204 No Content

  return response.json()
}

export const performBlob = async (endpoint: string, options?: RequestInit): Promise<Blob> => {
  const response = await performRaw(endpoint, options)

  return response.blob()
}
