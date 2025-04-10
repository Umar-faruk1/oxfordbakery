"use client"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

interface AdminHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function AdminHeader({ title, description, action }: AdminHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        <ModeToggle />
        {action && <Button onClick={action.onClick}>{action.label}</Button>}
      </div>
    </div>
  )
}
