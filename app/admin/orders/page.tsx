"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Eye, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AdminHeader } from "@/components/admin/admin-header"
import { useSupabase } from "@/components/supabase-provider"
import { toast } from "sonner"
import { OrderDetailsDialog } from "@/components/admin/order-details-dialog"

interface Order {
  id: number
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

export default function AdminOrdersPage() {
  const { supabase } = useSupabase()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [searchQuery, statusFilter, orders])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          user_id,
          status,
          total,
          delivery_address,
          phone_number,
          created_at,
          users (
            username,
            email
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setOrders(data || [])
      setFilteredOrders(data || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Failed to load orders")
    } finally {
      setIsLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = [...orders]

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order.id.toString().includes(query) ||
          order.users.username.toLowerCase().includes(query) ||
          order.users.email.toLowerCase().includes(query) ||
          order.delivery_address.toLowerCase().includes(query),
      )
    }

    setFilteredOrders(filtered)
  }

  const handleViewOrder = (order: Order) => {
    setCurrentOrder(order)
    setIsDialogOpen(true)
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

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    try {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id)

      if (error) throw error

      toast.success(`Order status updated to ${status}`)
      fetchOrders()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Failed to update order status")
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <AdminHeader title="Orders" description="Manage customer orders" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="h-4 w-[50px] animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-[150px] animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-[100px] animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-[80px] animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-[70px] animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-8 w-8 animate-pulse rounded bg-muted" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <p>{order.users.username}</p>
                      <p className="text-sm text-muted-foreground">{order.users.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>GH₵{order.total.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <OrderDetailsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        order={currentOrder}
        onUpdateStatus={handleUpdateOrderStatus}
      />
    </div>
  )
}
