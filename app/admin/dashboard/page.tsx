"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BarChart, Calendar, DollarSign, ShoppingBag, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSupabase } from "@/components/supabase-provider"
import { AdminHeader } from "@/components/admin/admin-header"
import { RecentOrders } from "@/components/admin/recent-orders"
import { SalesChart } from "@/components/admin/sales-chart"

export default function AdminDashboardPage() {
  const { supabase } = useSupabase()
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // Get total sales
        const { data: salesData, error: salesError } = await supabase.from("orders").select("total")

        if (salesError) throw salesError

        const totalSales = salesData.reduce((sum, order) => sum + order.total, 0)

        // Get total orders
        const { count: totalOrders, error: ordersError } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })

        if (ordersError) throw ordersError

        // Get pending orders
        const { count: pendingOrders, error: pendingError } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")

        if (pendingError) throw pendingError

        // Get total users
        const { count: totalUsers, error: usersError } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("role", "user")

        if (usersError) throw usersError

        setStats({
          totalSales,
          totalOrders: totalOrders || 0,
          totalUsers: totalUsers || 0,
          pendingOrders: pendingOrders || 0,
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [supabase])

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <AdminHeader title="Dashboard" description="Overview of your cake shop" />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">GH₵{stats.totalSales.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">+12.5% from last month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                  <p className="text-xs text-muted-foreground">Requires attention</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">+7.2% from last month</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>Monthly sales performance</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <SalesChart />
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentOrders />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Detailed analytics will be available soon.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <BarChart className="h-16 w-16 text-muted-foreground" />
              <p className="ml-4 text-muted-foreground">Analytics dashboard coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generate and download reports.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">Reports feature coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
