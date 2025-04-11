"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { CartItem, CartContextType } from "@/types"

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
      }
    }
  }, [])

  // Update localStorage and total whenever items change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))

    const newTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setTotal(newTotal)
  }, [items])

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
    toast.success("Cart cleared")
  }

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
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
