"use client"

import * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { ChevronLeft, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Slot } from "@radix-ui/react-slot"

interface SidebarContextType {
  state: {
    open: boolean
    openMobile: boolean
  }
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  toggleSidebar: () => void
  toggleMobile: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  const [openMobile, setOpenMobile] = useState(false)

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const storedOpen = localStorage.getItem("sidebar-open")
    if (storedOpen !== null) {
      setOpen(storedOpen === "true")
    }
  }, [])

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebar-open", open.toString())
  }, [open])

  const toggleSidebar = () => {
    setOpen(!open)
  }

  const toggleMobile = () => {
    setOpenMobile(!openMobile)
  }

  return (
    <SidebarContext.Provider
      value={{
        state: { open, openMobile },
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        toggleSidebar,
        toggleMobile,
      }}
          >
            {children}
      </SidebarContext.Provider>
    )
  }

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  const { open, openMobile, toggleSidebar } = useSidebar()

    return (
    <aside
          className={cn(
        "fixed inset-y-0 left-0 z-40 flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out",
        open ? "w-64" : "w-16",
        openMobile ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex h-14 items-center justify-end border-b px-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleSidebar}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", open ? "" : "rotate-180")} />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
            {children}
      </div>
    </aside>
  )
}

export function SidebarMobileTrigger() {
  const { openMobile, toggleMobile } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="fixed left-4 top-4 z-50 h-8 w-8 md:hidden"
      onClick={toggleMobile}
    >
      <Menu className="h-4 w-4" />
      <span className="sr-only">Toggle mobile sidebar</span>
    </Button>
  )
}

export function SidebarHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between px-4", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1 overflow-y-auto py-4", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarFooter({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-4 py-4", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarMenu({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarMenuItem({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarMenuButton({
      className,
  isActive,
  asChild,
      ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  isActive?: boolean
    asChild?: boolean
}) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(
        "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}
