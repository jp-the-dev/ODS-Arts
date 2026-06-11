/**
 * ODSArts — Shipping Types
 * Used by CheckoutForm (courier selector) and TrackingDrawer (account orders).
 */

export interface ShippingCourier {
  courier_id: number
  courier_name: string
  rate_paise: number
  estimated_delivery_days: number
  etd: string | null
  is_surface: boolean
}

export interface ShippingRatesResponse {
  pickup_postcode: string
  delivery_postcode: string
  weight_grams: number
  couriers: ShippingCourier[]
  recommended: ShippingCourier | null
}

export interface TrackingEvent {
  date: string | null
  time?: string | null
  activity: string | null
  location: string | null
  sr_status?: string | null
}

export interface TrackingResponse {
  order_number: string
  awb_code: string | null
  courier_name: string | null
  current_status: string
  shiprocket_status: string | null
  estimated_delivery_date: string | null
  etd?: string | null
  tracking_events: TrackingEvent[]
  message?: string
}
