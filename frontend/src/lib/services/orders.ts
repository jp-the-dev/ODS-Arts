import { apiFetch } from '@/lib/api/client'

export interface OrderItem {
  id: number
  product_id: number | null
  product_variant_id: number | null
  name: string
  sku: string | null
  unit_price_paise: number
  quantity: number
  subtotal_paise: number
  options: Record<string, unknown> | null
}

export interface Order {
  id: number
  order_number: string
  status: string
  subtotal: number
  tax: number
  shipping_cost: number
  discount: number
  total: number
  payment_status: string
  payment_method: string | null
  billing_address: Record<string, unknown> | null
  shipping_address: Record<string, unknown> | null
  currency: string
  notes: string | null
  ordered_at: string
  items: OrderItem[]
  created_at: string
}

export async function getOrders(): Promise<Order[]> {
  const res = await apiFetch<{ data: Order[] }>('/auth/orders')
  return res.data
}

export async function getOrder(orderNumber: string): Promise<Order> {
  const res = await apiFetch<{ data: Order }>(`/auth/orders/${orderNumber}`)
  return res.data
}
