"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Cake, Menu, ShoppingCart, User, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { useCart } from "@/lib/cart"
import { ModeToggle } from "@/components/mode-toggle"

export function MainNav() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { items } = useCart()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/menu",
      label: "Menu",
      active: pathname === "/menu",
    },
    {
      href: "/about",
      label: "About",
      active: pathname === "/about",
    },
    {
      href: "/contact",
      label: "Contact",
      active: pathname === "/contact",
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Cake className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">Oxford Bakery</span>
        </Link>

        <nav className="hidden md:flex md:items-center md:space-x-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                route.active ? "text-primary" : "text-muted-foreground",
              )}
            >
              {route.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-2">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {items.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {items.length}
                </span>
              )}
            </Button>
          </Link>

          <ModeToggle />

          {user ? (
            <div className="hidden md:block">
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="hidden md:block">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="default" size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="container pb-4 md:hidden"
        >
          <nav className="flex flex-col space-y-3">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  route.active ? "text-primary" : "text-muted-foreground",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {route.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Button
                  variant="ghost"
                  className="justify-start p-0 text-sm font-medium text-muted-foreground hover:text-primary"
                  onClick={() => {
                    signOut()
                    setIsMenuOpen(false)
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </motion.div>
      )}
    </header>
  )
}
