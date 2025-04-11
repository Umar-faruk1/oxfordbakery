"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { CartItem, CartContextType as CartContextTypeImport } from "@/types"

const CartContext = createContext<CartContextTypeImport | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [appliedPromo, setAppliedPromo] = useState<any>(null)

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    const savedPromo = localStorage.getItem("promo")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
      }
    }
    if (savedPromo) {
      try {
        setAppliedPromo(JSON.parse(savedPromo))
      } catch (error) {
        console.error("Failed to parse promo from localStorage:", error)
      }
    }
  }, [])

  // Update localStorage and total whenever items change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
    if (appliedPromo) {
      localStorage.setItem("promo", JSON.stringify(appliedPromo))
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const discount = appliedPromo ? (subtotal * appliedPromo.discount_percentage) / 100 : 0
    const deliveryFee = 15
    const newTotal = subtotal - discount + deliveryFee
    setTotal(newTotal)
  }, [items, appliedPromo])

  const addItem = (newItem: CartItem) => {
    setItems((prevItems) => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex((item) => item.id === newItem.id)

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += newItem.quantity
        return updatedItems
      }

      // Add new item if it doesn't exist
      return [...prevItems, newItem]
    })
  }

  const removeItem = (id: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
    toast.success("Item removed from cart")
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) {
      return removeItem(id)
    }

    setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setItems([])
    setAppliedPromo(null)
    localStorage.removeItem("promo")
    toast.success("Cart cleared")
  }

  const applyPromoCode = (promo: any) => {
    setAppliedPromo(promo)
    toast.success(`Promo code applied! ${promo.discount_percentage}% off`)
  }

  const removePromoCode = () => {
    setAppliedPromo(null)
    localStorage.removeItem("promo")
    toast.success("Promo code removed")
  }

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used inside CartProvider")
  }
  return context
}
