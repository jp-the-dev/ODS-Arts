import { apiFetch, fetchCsrfCookie } from '@/lib/api/client'

export interface Address {
  id: number
  label: string
  type: string
  is_default: boolean
  full_name: string
  phone: string
  address_line1: string
  address_line2: string | null
  city: string
  state: string
  postal_code: string
  country: string
  created_at: string
}

export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  auth_provider: string
  avatar_url: string | null
  addresses: Address[]
  created_at: string
}

export interface LoginInput {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface UpdateProfileInput {
  name?: string
  email?: string
  phone?: string | null
}

export interface UpdatePasswordInput {
  current_password: string
  new_password: string
  new_password_confirmation: string
}

/** POST /auth/login */
export async function login(input: LoginInput): Promise<{ message: string; user: User }> {
  await fetchCsrfCookie()
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

/** POST /auth/register */
export async function register(input: RegisterInput): Promise<{ message: string; user: User }> {
  await fetchCsrfCookie()
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

/** POST /auth/logout */
export async function logout(): Promise<{ message: string }> {
  const result = await apiFetch<{ message: string }>('/auth/logout', { method: 'POST' })
  return result
}

/** GET /auth/user */
export async function getUser(): Promise<User> {
  return apiFetch<User>('/auth/user')
}

/** PUT /auth/user */
export async function updateProfile(input: UpdateProfileInput): Promise<User> {
  return apiFetch<User>('/auth/user', {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

/** PUT /auth/user/password */
export async function updatePassword(input: UpdatePasswordInput): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/auth/user/password', {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

/** POST /auth/forgot-password */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

/** POST /auth/reset-password */
export async function resetPassword(input: {
  email: string
  token: string
  password: string
  password_confirmation: string
}): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
