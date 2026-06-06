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

const DEFAULT_REVALIDATE = process.env.NEXT_PUBLIC_API_REVALIDATE 
  ? parseInt(process.env.NEXT_PUBLIC_API_REVALIDATE, 10) 
  : 3600

export interface ApiFetchOptions extends Omit<RequestInit, 'next'> {
  /** ISR revalidation in seconds. Pass `false` to opt out of caching. */
  revalidate?: number | false
}

export async function apiFetch<T>(
  endpoint: string,
  { revalidate, ...options }: ApiFetchOptions = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
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
