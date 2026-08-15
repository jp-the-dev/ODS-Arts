'use client'

/**
 * ODSArts — Auth store
 *
 * Sanctum personal access tokens kept in localStorage, with the current user
 * hydrated on mount. Accounts are optional: guests can browse and check out, so
 * every consumer must handle `user === null` as a normal state, not an error.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { apiFetch, ApiError } from '@/lib/api/client'

const TOKEN_KEY = 'odsarts_token_v1'

export interface AuthUser {
  id: number
  name: string
  email: string
  phone: string | null
  auth_provider: string
  avatar_url: string | null
  created_at: string
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  /** True until the initial token check finishes — avoids a signed-out flash. */
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Read the stored token. Safe during SSR, where localStorage does not exist. */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

/** Authorization header for authenticated calls; empty when signed out. */
export function authHeaders(): Record<string, string> {
  const token = getStoredToken()

  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const persistToken = useCallback((next: string | null) => {
    setToken(next)
    try {
      if (next) localStorage.setItem(TOKEN_KEY, next)
      else localStorage.removeItem(TOKEN_KEY)
    } catch {
      // Private browsing or storage disabled — the session simply won't persist.
    }
  }, [])

  const loadUser = useCallback(async (bearer: string) => {
    try {
      const data = await apiFetch<AuthUser>('/auth/user', {
        headers: { Authorization: `Bearer ${bearer}` },
        revalidate: false,
      })
      setUser(data)
    } catch (error) {
      // A rejected token is stale (revoked, expired, or from another env) —
      // clear it rather than leaving the app in a half-authenticated state.
      if (error instanceof ApiError && error.status === 401) {
        persistToken(null)
        setUser(null)
        return
      }
      throw error
    }
  }, [persistToken])

  // Restore a session on first mount. The whole body runs asynchronously so no
  // state is set synchronously during the effect, which React 19 flags.
  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const stored = getStoredToken()

      if (stored) {
        setToken(stored)

        try {
          await loadUser(stored)
        } catch {
          setUser(null)
        }
      }

      if (!cancelled) setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [loadUser])

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiFetch<{ user: AuthUser; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        revalidate: false,
      })

      persistToken(data.token)
      setUser(data.user)
    },
    [persistToken]
  )

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await apiFetch<{ user: AuthUser; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: password,
        }),
        revalidate: false,
      })

      persistToken(data.token)
      setUser(data.user)
    },
    [persistToken]
  )

  const logout = useCallback(async () => {
    const current = getStoredToken()

    // Clear locally first: the customer is signed out from their point of view
    // even if the revoke call fails.
    persistToken(null)
    setUser(null)

    if (!current) return

    try {
      await apiFetch('/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${current}` },
        revalidate: false,
      })
    } catch {
      // Already-invalid token — nothing left to revoke.
    }
  }, [persistToken])

  const refresh = useCallback(async () => {
    const current = getStoredToken()
    if (current) await loadUser(current)
  }, [loadUser])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
      refresh,
    }),
    [user, token, isLoading, login, register, logout, refresh]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
