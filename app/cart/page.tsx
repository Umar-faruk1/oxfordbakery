"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import { useCart } from "@/lib/cart"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth"
import { useSupabase } from "@/components/supabase-provider"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Input } from '@/components/ui/input'

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, total } = useCart()
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const router = useRouter()
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<any>(null)
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
  const discount = appliedPromo ? (subtotal * appliedPromo.discount_percentage) / 100 : 0
  const totalWithoutDiscount = subtotal - discount

  const handleQuantityChange = (id: number, newQuantity: number) => {
    updateQuantity(id, newQuantity)
  }

  const handleRemoveItem = (id: number) => {
    removeItem(id)
  }

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code')
      return
    }

    if (appliedPromo) {
      toast.error('A promo code is already applied')
      return
    }

    if (isApplyingPromo) {
      return // Prevent multiple submissions while loading
    }

    setIsApplyingPromo(true)
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error('Invalid promo code')
        } else {
          throw error
        }
        return
      }

      if (!data) {
        toast.error('Invalid promo code')
        return
      }

      if (new Date(data.expiry_date) < new Date()) {
        toast.error('Promo code has expired')
        return
      }

      setAppliedPromo(data)
      setPromoCode('')
      toast.success(`Promo code applied! ${data.discount_percentage}% off`)
    } catch (error) {
      console.error('Error applying promo code:', error)
      toast.error('Failed to apply promo code')
    } finally {
      setIsApplyingPromo(false)
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    toast.success('Promo code removed')
  }

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Redirect to checkout page without creating an order
      router.push('/checkout')
    } catch (error) {
      console.error('Error during checkout:', error)
      toast.error('Failed to proceed to checkout')
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <section className="bg-muted py-12">
          <div className="container">
            <h1 className="text-center text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Your Cart</h1>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            {items.length > 0 ? (
              <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <div className="rounded-lg border bg-card shadow-sm">
                    <div className="p-6">
                      <h2 className="text-xl font-semibold">Cart Items</h2>
                      <Separator className="my-4" />

                      <div className="space-y-4">
                        {items.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-center gap-4"
                          >
                            <div className="h-16 w-16 overflow-hidden rounded-md">
                              <img
                                src={item.image || "/placeholder.svg?height=64&width=64"}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{item.name}</h3>
                              <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="mt-6 flex justify-between">
                        <Button variant="outline" onClick={() => clearCart()}>
                          Clear Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="rounded-lg border bg-card shadow-sm">
                    <div className="p-6">
                      <h2 className="text-xl font-semibold">Order Summary</h2>
                      <Separator className="my-4" />

                      <div className="space-y-4">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <span>
                              {item.name} x {item.quantity}
                            </span>
                            <span>{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}

                        {appliedPromo && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount ({appliedPromo.discount_percentage}%)</span>
                            <span>-{formatCurrency(discount)}</span>
                          </div>
                        )}

                        <Separator />

                        <div className="flex justify-between font-medium">
                          <span>Subtotal</span>
                          <span>{formatCurrency(subtotal)}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span>Delivery Fee</span>
                          <span>{formatCurrency(15)}</span>
                        </div>

                        <Separator />

                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span>{formatCurrency(totalWithoutDiscount + 15)}</span>
                        </div>
                      </div>

                      <div className="mt-6 space-y-4">
                        {appliedPromo ? (
                          <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                              <p className="font-medium">{appliedPromo.code}</p>
                              <p className="text-sm text-green-600">{appliedPromo.discount_percentage}% off</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleRemovePromo}>
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Input
                              placeholder="Enter promo code"
                              value={promoCode}
                              onChange={(e) => setPromoCode(e.target.value)}
                              className="w-full"
                            />
                            <Button
                              onClick={handleApplyPromo}
                              disabled={isApplyingPromo || !promoCode.trim()}
                              className="w-full"
                            >
                              {isApplyingPromo ? 'Applying...' : 'Apply Promo Code'}
                            </Button>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={handleCheckout}
                        className="mt-6 w-full bg-[#FF7F00] hover:bg-[#FF7F00]/90"
                      >
                        Proceed to Checkout
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <ShoppingCart className="mb-4 h-16 w-16 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Your cart is empty</h2>
                <p className="mt-2 text-muted-foreground">
                  Looks like you haven&apos;t added any cakes to your cart yet.
                </p>
                <Link href="/menu">
                  <Button className="mt-6">Browse Menu</Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
