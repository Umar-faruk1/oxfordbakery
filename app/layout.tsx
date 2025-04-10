import type React from "react"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { SupabaseProvider } from "@/components/supabase-provider"
import { AuthProvider } from "@/lib/auth"
import { CartProvider } from "@/lib/cart"
import { SidebarProvider } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import "./globals.css"

export const metadata = {
  title: "Oxford Bakery | Cake Ordering",
  description: "Order delicious custom cakes for any occasion",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SupabaseProvider>
            <AuthProvider>
              <CartProvider>
                <SidebarProvider>
                  {children}
                  <Toaster />
                </SidebarProvider>
              </CartProvider>
            </AuthProvider>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}