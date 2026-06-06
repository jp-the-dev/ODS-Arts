'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getUser, login as apiLogin, logout as apiLogout, register as apiRegister } from '@/lib/services/auth'
import type { User, LoginInput, RegisterInput } from '@/lib/services/auth'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (input: LoginInput) => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const u = await getUser()
      setUser(u)
    } catch {
      setUser(null)
    }
  }, [])

  // Restore session on mount
  useEffect(() => {
    refreshUser().finally(() => setLoading(false))
  }, [refreshUser])

  const loginFn = useCallback(async (input: LoginInput): Promise<User> => {
    const { user: loggedInUser } = await apiLogin(input)
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const registerFn = useCallback(async (input: RegisterInput): Promise<User> => {
    const { user: newUser } = await apiRegister(input)
    setUser(newUser)
    return newUser
  }, [])

  const logoutFn = useCallback(async (): Promise<void> => {
    await apiLogout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login: loginFn, register: registerFn, logout: logoutFn, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
