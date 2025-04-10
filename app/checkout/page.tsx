"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react"

import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth"
import { useCart } from "@/lib/cart"
import { useSupabase } from "@/components/supabase-provider"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import { PaystackButton } from "@/components/paystack-button"

export default function CheckoutPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { items, total, clearCart } = useCart()
  const { supabase } = useSupabase()
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderIdParam = searchParams.get('orderId')

  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<number | null>(null)
  const [orderAmount, setOrderAmount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [existingOrder, setExistingOrder] = useState<any>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/login?redirect=/checkout")
      return
    }

    // If we have an orderId parameter, fetch the existing order
    if (orderIdParam) {
      fetchExistingOrder(orderIdParam)
    } else if (items.length === 0) {
      // Only redirect to cart if we don't have an orderId and cart is empty
      router.push("/cart")
      return
    } else {
      // Fetch user profile to pre-fill data
      fetchProfile()
    }
  }, [user, authLoading, items, router, orderIdParam])

  const fetchExistingOrder = async (id: string) => {
    setIsLoading(true)
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", parseInt(id))
        .single()

      if (error) throw error

      // Check if the order belongs to the current user
      if (order.user_id !== user?.id) {
        toast.error("You don't have permission to view this order")
        router.push("/profile")
        return
      }

      setExistingOrder(order)
      setOrderId(order.id)
      setOrderAmount(order.total)
      setDeliveryAddress(order.delivery_address || "")
      setPhoneNumber(order.phone_number || "")
      setSpecialInstructions(order.special_instructions || "")
    } catch (error) {
      console.error("Error fetching order:", error)
      toast.error("Failed to load order details")
      router.push("/cart")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("phone_number, delivery_address")
        .eq("id", user?.id as string)
        .single()

      if (!error && data) {
        // Use type assertion to handle the database schema
        const userData = data as { phone_number?: string; delivery_address?: string }
        setPhoneNumber(userData.phone_number || "")
        setDeliveryAddress(userData.delivery_address || "")
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateOrder = async () => {
    if (!deliveryAddress.trim()) {
      toast.error("Please enter a delivery address")
      return false
    }

    if (!phoneNumber.trim()) {
      toast.error("Please enter a phone number")
      return false
    }

    setIsSubmitting(true)

    try {
      // Create order in Supabase
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user!.id,
          status: "pending",
          total: total,
          delivery_address: deliveryAddress,
          phone_number: phoneNumber,
          special_instructions: specialInstructions,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      // Update user profile with delivery address and phone if they want to save it
      await supabase
        .from("users")
        .update({
          phone_number: phoneNumber,
          delivery_address: deliveryAddress,
        } as any)
        .eq("id", user!.id)

      setOrderId(order.id)
      setOrderAmount(order.total)
      return true
    } catch (error) {
      console.error("Error creating order:", error)
      toast.error("Failed to create order. Please try again.")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateOrder = async () => {
    if (!deliveryAddress.trim()) {
      toast.error("Please enter a delivery address")
      return false
    }

    if (!phoneNumber.trim()) {
      toast.error("Please enter a phone number")
      return false
    }

    setIsSubmitting(true)

    try {
      // Update order in Supabase
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          delivery_address: deliveryAddress,
          phone_number: phoneNumber,
          special_instructions: specialInstructions,
        })
        .eq("id", orderId!)

      if (orderError) throw orderError

      // Update user profile with delivery address and phone
      await supabase
        .from("users")
        .update({
          phone_number: phoneNumber,
          delivery_address: deliveryAddress,
        } as any)
        .eq("id", user!.id)

      return true
    } catch (error) {
      console.error("Error updating order:", error)
      toast.error("Failed to update order. Please try again.")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaymentSuccess = (reference: string) => {
    // Update order with payment reference
    const updateOrder = async () => {
      try {
        await supabase
          .from("orders")
          .update({
            payment_reference: reference,
            status: "processing",
          })
          .eq("id", orderId as number)

        toast.success("Payment successful! Your order has been placed.")
        clearCart()
        router.push(`/orders/${orderId}`)
      } catch (error) {
        console.error("Error updating order:", error)
      }
    }

    updateOrder()
  }

  const handleProceedToPayment = async () => {
    if (existingOrder) {
      // If we have an existing order, just update it
      const success = await handleUpdateOrder()
      if (success) {
        setOrderId(existingOrder.id)
      }
    } else {
      // If we don't have an existing order, create a new one
      const success = await handleCreateOrder()
      if (!success) {
        return
      }
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 py-12">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-8 flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => router.push("/cart")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">Checkout</h1>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Information</CardTitle>
                    <CardDescription>Enter your delivery details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Delivery Address</Label>
                      <Textarea
                        id="address"
                        placeholder="Enter your full delivery address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        rows={3}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                      <Textarea
                        id="instructions"
                        placeholder="Any special instructions for your order"
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>Complete your order with secure payment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <span className="font-medium">Pay with Card (Paystack)</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Secure payment processing by Paystack. Your card details are not stored on our servers.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {orderId ? (
                      <PaystackButton
                        email={user?.email || ""}
                        amount={orderAmount * 100} // Convert to kobo (smallest currency unit)
                        reference={`order_${orderId}_${Date.now()}`}
                        onSuccess={handlePaymentSuccess}
                        metadata={{
                          order_id: orderId,
                          user_id: user?.id,
                        }}
                      />
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={handleProceedToPayment}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Proceed to Payment"
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                    <CardDescription>Review your order details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {existingOrder ? (
                        // If we have an existing order, show its items
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Order #{existingOrder.id}
                          </p>
                          <Separator />
                          <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>{formatCurrency(existingOrder.total)}</span>
                          </div>
                        </div>
                      ) : (
                        // If we don't have an existing order, show cart items
                        <>
                          {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatCurrency(item.price)} x {item.quantity}
                                </p>
                              </div>
                              <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                          ))}
                          <Separator />
                          <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>{formatCurrency(total)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
