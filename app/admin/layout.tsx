"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarProvider, useSidebar, SidebarMobileTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)
  const { open, openMobile } = useSidebar()

  useEffect(() => {
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (!isLoading && (!user || !isAdmin)) {
        setRedirecting(true)
        router.push("/login")
      }
    }, 3000) // 3 second timeout

    return () => clearTimeout(timeoutId)
  }, [user, isAdmin, isLoading, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading admin panel...</p>
      </div>
    )
  }

  // Show redirecting state
  if (redirecting) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Redirecting to login...</p>
      </div>
    )
  }

  // If not admin, don't render anything (will be redirected)
  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="relative flex min-h-screen">
      <SidebarMobileTrigger />
      <AdminSidebar />
      <main 
        className={cn(
          "flex-1 transition-all duration-300",
          "p-4 md:p-8",
          "pt-16 md:pt-20",
          openMobile ? "translate-x-64" : "translate-x-0",
          open ? "md:ml-64" : "md:ml-16"
        )}
      >
        <div className="fixed right-4 top-4 z-50">
          <ThemeToggle />
        </div>
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  )
}
