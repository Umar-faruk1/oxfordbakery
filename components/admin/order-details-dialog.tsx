"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useSupabase } from "@/components/supabase-provider"
import { toast } from "sonner"
import { Order, OrderDetailsDialogProps } from "@/types"

interface OrderItem {
  id: number
  quantity: number
  menu_items: {
    id: number
    name: string
    price: number
    image_url: string
  }
}

export function OrderDetailsDialog({ open, onOpenChange, order, onUpdateStatus }: OrderDetailsDialogProps) {
  const { supabase } = useSupabase()
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState("")

  useEffect(() => {
    if (order) {
      setStatus(order.status)
      fetchOrderItems(order.id)
    }
  }, [order])

  const fetchOrderItems = async (orderId: number) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
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
        .eq("order_id", orderId)

      if (error) throw error
      console.log("orderItems", data)

      setOrderItems(data || [])
    } catch (error) {
      console.error("Error fetching order items:", error)
      toast.error("Failed to load order details")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500/20 text-green-600 hover:bg-green-500/20"
      case "processing":
        return "bg-blue-500/20 text-blue-600 hover:bg-blue-500/20"
      case "pending":
        return "bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/20"
      case "cancelled":
        return "bg-red-500/20 text-red-600 hover:bg-red-500/20"
      default:
        return "bg-gray-500/20 text-gray-600 hover:bg-gray-500/20"
    }
  }


  const handleUpdateStatus = () => {
    if (order) {
      onUpdateStatus(order.id, status)
    }
  }

  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Order #{order.order_number}</DialogTitle>
          <DialogDescription>Order details and management</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Customer</h3>
              <p className="font-medium">{order.users.username}</p>
              <p className="text-sm">{order.users.email}</p>
              <p className="text-sm mt-1">Phone: {order.phone_number}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Order Date</h3>
              <p>{new Date(order.created_at).toLocaleString()}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Delivery Address</h3>
            <p className="whitespace-pre-line">{order.delivery_address}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
            <div className="mt-1 flex items-center gap-4">
              <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Update status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 font-medium">Order Items</h3>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex animate-pulse items-center gap-4">
                    <div className="h-12 w-12 rounded bg-muted" />
                    <div className="space-y-2">
                      <div className="h-4 w-[200px] rounded bg-muted" />
                      <div className="h-4 w-[100px] rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : orderItems.length > 0 ? (
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="h-12 w-12 overflow-hidden rounded">
                      <img
                        src={item.menu_items.image_url || "/placeholder.svg?height=48&width=48"}
                        alt={item.menu_items.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.menu_items.name}</p>
                      <p className="text-sm text-muted-foreground">
                        GH₵{item.menu_items.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">GH₵{(item.menu_items.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between">
                  <p className="font-medium">Total</p>
                  <p className="font-bold">GH₵{order.total.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No items found for this order</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleUpdateStatus} disabled={status === order.status}>
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
