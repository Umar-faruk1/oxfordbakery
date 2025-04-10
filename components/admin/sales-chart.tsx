"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useSupabase } from "@/components/supabase-provider"

interface SalesData {
  name: string
  total: number
}

export function SalesChart() {
  const { theme } = useTheme()
  const { supabase } = useSupabase()
  const [data, setData] = useState<SalesData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSalesData = async () => {
      setIsLoading(true)
      try {
        // In a real app, you would fetch actual monthly data
        // For now, we'll generate mock data
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        // Generate random sales data for each month
        const mockData = months.map((month) => ({
          name: month,
          total: Math.floor(Math.random() * 5000) + 1000,
        }))

        setData(mockData)
      } catch (error) {
        console.error("Error fetching sales data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSalesData()
  }, [supabase])

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => `$${value}`}
        />
        <Tooltip
          formatter={(value: number) => [`$${value}`, "Revenue"]}
          contentStyle={{
            backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
            borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
            color: theme === "dark" ? "#ffffff" : "#000000",
          }}
        />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}
