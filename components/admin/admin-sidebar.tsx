"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Cake, LayoutDashboard, LogOut, Settings, ShoppingCart, Tag, Users, Ticket } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { open } = useSidebar()

  const routes = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/admin/dashboard",
    },
    {
      href: "/admin/menu",
      label: "Menu Management",
      icon: Cake,
      active: pathname === "/admin/menu",
    },
    {
      href: "/admin/categories",
      label: "Categories",
      icon: Tag,
      active: pathname === "/admin/categories",
    },
    {
      href: "/admin/promo-codes",
      label: "Promo Codes",
      icon: Ticket,
      active: pathname === "/admin/promo-codes",
    },
    {
      href: "/admin/orders",
      label: "Orders",
      icon: ShoppingCart,
      active: pathname === "/admin/orders",
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: Users,
      active: pathname === "/admin/users",
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/admin/settings",
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <Cake className="h-6 w-6" />
          <span className={cn(
            "text-lg font-bold whitespace-nowrap transition-all duration-300",
            open ? "w-auto opacity-100" : "w-0 opacity-0"
          )}>Admin Panel</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {routes.map((route) => (
            <SidebarMenuItem key={route.href}>
              <SidebarMenuButton asChild isActive={route.active}>
                <Link href={route.href}>
                  <div className="flex items-center gap-2">
                    <route.icon className="h-5 w-5" />
                    <span className={cn(
                      "whitespace-nowrap transition-all duration-300",
                      open ? "w-auto opacity-100" : "w-0 opacity-0"
                    )}>{route.label}</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.user_metadata?.username?.charAt(0) || user?.email?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                <span className={cn(
                  "whitespace-nowrap transition-all duration-300",
                  open ? "w-auto opacity-100" : "w-0 opacity-0"
                )}>{user?.user_metadata?.username || user?.email}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut()}>
              <LogOut className="h-5 w-5" />
              <span className={cn(
                "whitespace-nowrap transition-all duration-300",
                open ? "w-auto opacity-100" : "w-0 opacity-0"
              )}>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
