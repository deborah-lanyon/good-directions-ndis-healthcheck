/**
 * Get CSRF token from cookie
 */
export function getCsrfToken(): string {
  const csrfToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1]

  return csrfToken ? decodeURIComponent(csrfToken) : ''
}

/**
 * Get headers object with CSRF token for fetch requests
 */
export function getCsrfHeaders(additionalHeaders: Record<string, string> = {}): HeadersInit {
  return {
    'X-XSRF-TOKEN': getCsrfToken(),
    ...additionalHeaders,
  }
}

/**
 * Wrapper around fetch that automatically includes CSRF token
 */
export async function fetchWithCsrf(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers)
  headers.set('X-XSRF-TOKEN', getCsrfToken())

  return fetch(url, {
    ...options,
    headers,
    credentials: options.credentials || 'same-origin',
  })
}
