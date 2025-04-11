"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { useCart } from "@/lib/cart"
import { useSupabase } from "@/components/supabase-provider"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: any) => {
        openIframe: () => void
      }
    }
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { items, total, clearCart, appliedPromo } = useCart()
  const { supabase } = useSupabase()
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = appliedPromo ? (subtotal * appliedPromo.discount_percentage) / 100 : 0
  const deliveryFee = 15
  const finalTotal = subtotal - discount + deliveryFee

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (items.length === 0) {
      router.push("/menu")
      return
    }
  }, [user, items, router])

  const handleCheckout = async () => {
    if (!deliveryAddress.trim() || !phoneNumber.trim()) {
      toast.error("Please provide delivery address and phone number")
      return
    }

    if (!user?.id) {
      toast.error("User not authenticated")
      return
    }

    setIsLoading(true)
    try {
      // Initialize Paystack payment
      const paymentHandler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email: user.email,
        amount: finalTotal * 100, // Convert to kobo
        currency: "GHS",
        ref: `order_${Date.now()}`,
        callback: function(response: any) {
          if (response.status === "success") {
            handlePaymentSuccess(response.reference)
          } else {
            toast.error("Payment failed. Please try again.")
          }
        },
        onClose: function() {
          toast.error("Payment cancelled")
          setIsLoading(false)
        }
      })

      paymentHandler.openIframe()
    } catch (error) {
      console.error("Error during checkout:", error)
      toast.error("Failed to process order. Please try again.")
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = async (reference: string) => {
    try {
      if (!user?.id) {
        throw new Error("User ID is required")
      }

      // Create order after successful payment
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total: finalTotal,
          status: "pending",
          delivery_address: deliveryAddress,
          phone_number: phoneNumber,
          payment_reference: reference,
          promo_code_id: appliedPromo?.id,
          discount_amount: discount
        })
        .select()
        .single()

      if (orderError) throw orderError

      if (!order) {
        throw new Error("Failed to create order")
      }

      // Create order items
      const { error: orderItemsError } = await supabase
        .from("order_items")
        .insert(
          items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price,
      }))
        )

      if (orderItemsError) throw orderItemsError

      // Clear cart
      clearCart()

      // Show success message
      toast.success("Order placed successfully!")

      // Redirect to order details page
      router.push(`/orders/${order.id}`)
    } catch (error) {
      console.error("Error creating order:", error)
      toast.error("Failed to create order. Please contact support.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || items.length === 0) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <section className="bg-muted py-12">
          <div className="container">
            <h1 className="text-center text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Checkout
            </h1>
          </div>
        </section>

        <section className="py-12">
        <div className="container">
            <div className="mx-auto max-w-2xl">
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold">Order Summary</h2>
                  <div className="mt-4 space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>
                          {item.name} x {item.quantity}
                        </span>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-4">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      {appliedPromo && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount ({appliedPromo.discount_percentage}%)</span>
                          <span>-{formatCurrency(discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span>{formatCurrency(deliveryFee)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>{formatCurrency(finalTotal)}</span>
                      </div>
                    </div>
                  </div>
            </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="delivery-address" className="block text-sm font-medium">
                      Delivery Address
                    </label>
                    <Input
                      id="delivery-address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter your delivery address"
                      className="mt-1"
                      />
                    </div>

                  <div>
                    <label htmlFor="phone-number" className="block text-sm font-medium">
                      Phone Number
                    </label>
                      <Input
                      id="phone-number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter your phone number"
                      className="mt-1"
                      />
                    </div>
                    </div>

                      <Button 
                  onClick={handleCheckout}
                  disabled={isLoading}
                        className="w-full" 
                >
                  {isLoading ? "Processing..." : "Place Order"}
                      </Button>
              </div>
            </div>
        </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
