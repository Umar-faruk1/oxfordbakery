// Cart Types
export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
}

export interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  total: number
  appliedPromo: any | null
  applyPromoCode: (promo: any) => void
  removePromoCode: () => void
}

// Order Types
export interface Order {
  id: number
  order_number: number
  user_id: string
  status: string
  total: number
  delivery_address: string
  phone_number: string
  created_at: string
  users: {
    username: string
    email: string
  }
}

export interface OrderDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
  onUpdateStatus: (id: number, status: string) => void
}

// Menu Item Types
export interface MenuItem {
  id: number
  name: string
  price: number
  description: string
  category_id: number
  image_url: string
  created_at: string
}

export interface MenuItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: MenuItem
  onSave: (item: MenuItem) => void
}

// Promo Code Types
export interface PromoCode {
  id: number
  code: string
  discount_percentage: number
  is_active: boolean
  expiry_date: string
  created_at: string
}

// User Types
export interface User {
  id: string
  email: string
  username: string
  role: string
  avatar_url: string | null
  created_at: string
  phone_number?: string
  delivery_address?: string
} 