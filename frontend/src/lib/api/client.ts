/**
 * ODSArts API client
 *
 * A lightweight typed fetch wrapper used by all service files.
 *
 * - Server Components: pass `revalidate` (seconds) to control ISR caching.
 *   Use `revalidate: false` for dynamic data that must never be cached.
 * - Client Components: the same function works — Next.js fetch() runs in
 *   the browser without the server-side caching semantics.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

const APP_URL = BASE_URL.replace(/\/api\/v1\/?$/, '')

const DEFAULT_REVALIDATE = process.env.NEXT_PUBLIC_API_REVALIDATE 
  ? parseInt(process.env.NEXT_PUBLIC_API_REVALIDATE, 10) 
  : 3600

/** Read a cookie value by name (browser only). */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export interface ApiFetchOptions extends Omit<RequestInit, 'next'> {
  /** ISR revalidation in seconds. Pass `false` to opt out of caching. */
  revalidate?: number | false
}

export async function apiFetch<T>(
  endpoint: string,
  { revalidate, ...options }: ApiFetchOptions = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`

  const method = options.method ?? 'GET'
  const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)

  const csrfToken = isStateChanging ? getCookie('XSRF-TOKEN') : null

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }

  if (csrfToken) {
    headers['X-XSRF-TOKEN'] = csrfToken
  }

  const res = await fetch(url, {
    headers,
    credentials: 'include',
    // Only attach next config on the server (Next.js fetch extension)
    ...(typeof window === 'undefined' && {
      next:
        revalidate === false
          ? { revalidate: 0 }
          : revalidate !== undefined
            ? { revalidate }
            : { revalidate: DEFAULT_REVALIDATE },
    }),
    ...options,
  })

  if (!res.ok) {
    // Laravel validation errors (422) contain a `errors` object
    if (res.status === 422) {
      const body = await res.json()
      throw new ApiValidationError(body.message ?? 'Validation failed.', body.errors ?? {})
    }

    throw new ApiError(res.status, `API error ${res.status} at ${endpoint}`)
  }

  const json = await res.json()
  // Unwrap Laravel's standard { data: ... } envelope if present
  return ('data' in json ? json.data : json) as T
}

/**
 * Fetch the XSRF cookie from the server so subsequent POST requests
 * carry the CSRF token. Must be called before login/register for
 * Sanctum SPA authentication.
 */
export async function fetchCsrfCookie(): Promise<void> {
  await fetch(`${APP_URL}/sanctum/csrf-cookie`, { credentials: 'include' })
}

// ---- Error classes --------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ApiValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: Record<string, string[]>
  ) {
    super(message)
    this.name = 'ApiValidationError'
  }
}
