import { apiFetch } from '@/lib/api/client'
import type { Address } from '@/lib/services/auth'

export type { Address }

export interface CreateAddressInput {
  label: string
  type?: string
  is_default?: boolean
  full_name: string
  phone: string
  address_line1: string
  address_line2?: string | null
  city: string
  state: string
  postal_code: string
  country?: string
}

export interface UpdateAddressInput {
  label?: string
  type?: string
  is_default?: boolean
  full_name?: string
  phone?: string
  address_line1?: string
  address_line2?: string | null
  city?: string
  state?: string
  postal_code?: string
  country?: string
}

export function getAddresses(): Promise<Address[]> {
  return apiFetch<Address[]>('/auth/addresses')
}

export function createAddress(input: CreateAddressInput): Promise<Address> {
  return apiFetch<Address>('/auth/addresses', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateAddress(id: number, input: UpdateAddressInput): Promise<Address> {
  return apiFetch<Address>(`/auth/addresses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function deleteAddress(id: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/auth/addresses/${id}`, {
    method: 'DELETE',
  })
}
