"use client"

import type React from "react"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:text-white group-[.toaster]:shadow-lg",
          success: "group-[.toaster]:bg-green-500 group-[.toaster]:border-green-500",
          error: "group-[.toaster]:bg-red-500 group-[.toaster]:border-red-500",
          description: "group-[.toast]:text-white/90",
          actionButton: "group-[.toast]:bg-white group-[.toast]:text-current",
          cancelButton: "group-[.toast]:bg-white/20 group-[.toast]:text-white",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
