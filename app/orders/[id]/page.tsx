"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2 } from "lucide-react"

import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth"
import { useSupabase } from "@/components/supabase-provider"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const { user, isLoading: authLoading } = useAuth()
  const { supabase } = useSupabase()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Get the order ID from params
  const orderId = params.id

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/login")
      return
    }

    fetchOrderDetails()
  }, [user, authLoading, orderId])

  const fetchOrderDetails = async () => {
    setIsLoading(true)
    try {
      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", parseInt(orderId))
        .single()

      if (orderError) throw orderError

      // Check if the order belongs to the current user
      if (orderData.user_id !== user?.id) {
        toast.error("You don't have permission to view this order")
        router.push("/profile")
        return
      }

      setOrder(orderData)

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select(`
          *,
          menu_items (
            id,
            name,
            price,
            image_url
          )
        `)
        .eq("order_id", parseInt(orderId))

      if (itemsError) throw itemsError
      setOrderItems(itemsData || [])
    } catch (error) {
      console.error("Error fetching order details:", error)
      toast.error("Failed to load order details")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500/20 text-green-600"
      case "processing":
        return "bg-blue-500/20 text-blue-600"
      case "pending":
        return "bg-yellow-500/20 text-yellow-600"
      case "cancelled":
        return "bg-red-500/20 text-red-600"
      default:
        return "bg-gray-500/20 text-gray-600"
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

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Order not found</h1>
            <p className="mt-2 text-muted-foreground">
              The order you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button className="mt-4" onClick={() => router.push("/profile")}>
              Back to Profile
            </Button>
          </div>
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
              <Button variant="outline" size="icon" onClick={() => router.push("/profile")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">Order #{orderId}</h1>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                    <CardDescription>Items included in your order</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="h-16 w-16 overflow-hidden rounded-md">
                            <img
                              src={item.menu_items.image_url || "/placeholder.svg?height=64&width=64"}
                              alt={item.menu_items.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{item.menu_items.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(item.menu_items.price)} x {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium">{formatCurrency(item.menu_items.price * item.quantity)}</p>
                        </div>
                      ))}

                      <Separator className="my-4" />

                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                    <CardDescription>Information about your order</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Order Date</h3>
                      <p>{new Date(order.created_at).toLocaleString()}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                      <div
                        className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Delivery Address</h3>
                      <p className="whitespace-pre-line">{order.delivery_address}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Payment Method</h3>
                      <p>Paystack (Card Payment)</p>
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
