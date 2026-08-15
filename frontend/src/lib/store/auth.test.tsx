import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { AuthProvider, useAuth, getStoredToken, authHeaders } from '@/lib/store/auth'

const TOKEN_KEY = 'odsarts_token_v1'

const USER = {
  id: 1, name: 'Priya Mehta', email: 'priya@example.com', phone: null,
  auth_provider: 'email', avatar_url: null, created_at: '2026-08-01T00:00:00Z',
}

/** Minimal stand-in for the Laravel envelope apiFetch unwraps. */
function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response)
}

function mockFetch(handler: (url: string, init?: RequestInit) => Promise<Response>) {
  const spy = vi.fn((input: RequestInfo | URL, init?: RequestInit) =>
    handler(String(input), init)
  )
  vi.stubGlobal('fetch', spy)

  return spy
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

const renderAuth = () => renderHook(() => useAuth(), { wrapper })

beforeEach(() => {
  mockFetch(() => jsonResponse({ data: null }))
})

describe('auth store', () => {
  it('starts signed out with no stored token', async () => {
    const { result } = renderAuth()

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('signs in, storing the token and user', async () => {
    mockFetch((url) =>
      url.includes('/auth/login')
        ? jsonResponse({ data: { user: USER, token: 'tok_123' } })
        : jsonResponse({ data: USER })
    )

    const { result } = renderAuth()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.login('priya@example.com', 'sup3r-secret')
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.email).toBe('priya@example.com')
    expect(getStoredToken()).toBe('tok_123')
  })

  it('restores a session from a stored token on mount', async () => {
    localStorage.setItem(TOKEN_KEY, 'tok_existing')
    mockFetch(() => jsonResponse({ data: USER }))

    const { result } = renderAuth()

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.user?.email).toBe('priya@example.com')
  })

  it('sends the stored token as a bearer header', async () => {
    localStorage.setItem(TOKEN_KEY, 'tok_existing')
    const spy = mockFetch(() => jsonResponse({ data: USER }))

    renderAuth()

    await waitFor(() => expect(spy).toHaveBeenCalled())

    const init = spy.mock.calls[0][1] as RequestInit
    const headers = init.headers as Record<string, string>

    expect(headers.Authorization).toBe('Bearer tok_existing')
    // Regression: options used to be spread over headers, dropping these — and
    // without Accept, Laravel answers with an HTML redirect instead of 401 JSON.
    expect(headers.Accept).toBe('application/json')
  })

  it('discards a token the server rejects', async () => {
    localStorage.setItem(TOKEN_KEY, 'tok_revoked')
    mockFetch(() => jsonResponse({ message: 'Unauthenticated.' }, 401))

    const { result } = renderAuth()

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isAuthenticated).toBe(false)
    expect(getStoredToken()).toBeNull()
  })

  it('keeps the session when the profile call fails for a non-auth reason', async () => {
    localStorage.setItem(TOKEN_KEY, 'tok_ok')
    mockFetch(() => Promise.reject(new Error('offline')))

    const { result } = renderAuth()

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // A network blip must not sign the customer out.
    expect(getStoredToken()).toBe('tok_ok')
  })

  it('signs out locally even when the revoke call fails', async () => {
    localStorage.setItem(TOKEN_KEY, 'tok_123')
    mockFetch((url) =>
      url.includes('/auth/logout')
        ? Promise.reject(new Error('offline'))
        : jsonResponse({ data: USER })
    )

    const { result } = renderAuth()
    await waitFor(() => expect(result.current.user).not.toBeNull())

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(getStoredToken()).toBeNull()
  })

  it('exposes an empty header set when signed out', () => {
    expect(authHeaders()).toEqual({})
  })

  it('surfaces a failed login instead of half-authenticating', async () => {
    mockFetch(() =>
      jsonResponse({ message: 'Invalid.', errors: { email: ['These credentials do not match our records.'] } }, 422)
    )

    const { result } = renderAuth()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await expect(
      act(async () => {
        await result.current.login('priya@example.com', 'wrong')
      })
    ).rejects.toThrow()

    expect(result.current.isAuthenticated).toBe(false)
    expect(getStoredToken()).toBeNull()
  })
})
