"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: { id: number; name: string } | null
  onSave: (name: string) => void
}

export function CategoryDialog({ open, onOpenChange, category, onSave }: CategoryDialogProps) {
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (category) {
      setName(category.name)
    } else {
      setName("")
    }
    setError("")
  }, [category, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Category name is required")
      return
    }

    onSave(name)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "Add Category"}</DialogTitle>
          <DialogDescription>
            {category ? "Update the category name." : "Create a new category for your menu items."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError("")
                }}
                className={error ? "border-destructive" : ""}
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{category ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
