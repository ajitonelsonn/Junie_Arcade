// API helper with authentication
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ''

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>
}

export async function apiFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Add API key if configured
  if (API_KEY) {
    headers['x-api-key'] = API_KEY
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

// Convenience methods
export const api = {
  get: (url: string, options?: FetchOptions) =>
    apiFetch(url, { ...options, method: 'GET' }),

  post: (url: string, body: any, options?: FetchOptions) =>
    apiFetch(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body)
    }),

  put: (url: string, body: any, options?: FetchOptions) =>
    apiFetch(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body)
    }),

  delete: (url: string, options?: FetchOptions) =>
    apiFetch(url, { ...options, method: 'DELETE' }),
}
