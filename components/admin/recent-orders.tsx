"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Order {
  id: number
  created_at: string
  status: string
  phone_number: string
  delivery_address: string
  total: number
  user: {
    username: string
    email: string
  }
}

export function RecentOrders() {
  const { supabase } = useSupabase()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecentOrders = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("orders")
          .select(`
            id,
            created_at,
            status,
            phone_number,
            delivery_address,
            total,
            users (
              username,
              email
            )
          `)
          .order("created_at", { ascending: false })
          .limit(5)

        if (error) throw error
        const transformedData = (data || []).map((order: any) => ({
          id: order.id,
          created_at: order.created_at,
          status: order.status,
          phone_number: order.phone_number,
          delivery_address: order.delivery_address,
          total: order.total,
          user: {
            username: order.users?.username || "Unknown User",
            email: order.users?.email || "",
          },
        }))
        setOrders(transformedData)
      } catch (error) {
        console.error("Error fetching recent orders:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentOrders()
  }, [supabase])

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.length > 0 ? (
        orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2 text-primary">#{order.id}</div>
              <div>
                <p className="font-medium">{order.user?.username || "Unknown User"}</p>
                <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
              <p className="font-medium">${order.total.toFixed(2)}</p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-muted-foreground">No recent orders</p>
      )}
    </div>
  )
}
