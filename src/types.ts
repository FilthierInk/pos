export type Product = {
  uuid: string
  sku: string
  sat_code: string
  description: string
  suggested_price: number
}

export type Client = { uuid: string; name: string }

export type CartItem = {
  product: Product
  unit_price: number
  quantity: number
}

export const PAYMENT_METHODS = ['cash', 'card', 'transfer', 'credit'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]