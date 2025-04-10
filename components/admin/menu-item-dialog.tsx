"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSupabase } from "@/components/supabase-provider"
import { toast } from "sonner"
import { MenuItem, MenuItemDialogProps } from "@/types"

interface Category {
  id: number
  name: string
}

export function MenuItemDialog({ open, onOpenChange, item, onSave }: MenuItemDialogProps) {
  const { supabase } = useSupabase()
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category_id: "",
    image_url: "",
  })
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        price: item.price.toString(),
        description: item.description,
        category_id: item.category_id.toString(),
        image_url: item.image_url,
      })
    } else {
      setFormData({
        name: "",
        price: "",
        description: "",
        category_id: "",
        image_url: "",
      })
    }
  }, [item])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name")

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Failed to load categories")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category_id: value }))

    // Clear error when user selects
    if (errors.category_id) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.category_id
        return newErrors
      })
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }

    setIsUploading(true)

    try {
      // Generate a unique file name
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `menu-items/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage.from("images").upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage.from("images").getPublicUrl(filePath)

      setFormData((prev) => ({ ...prev, image_url: data.publicUrl }))
      toast.success("Image uploaded successfully")
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.price.trim()) {
      newErrors.price = "Price is required"
    } else if (isNaN(Number.parseFloat(formData.price)) || Number.parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be a positive number"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.category_id) {
      newErrors.category_id = "Category is required"
    }

    if (!formData.image_url) {
      newErrors.image_url = "Image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    onSave({
      ...formData,
      price: Number.parseFloat(formData.price),
      category_id: Number.parseInt(formData.category_id),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
          <DialogDescription>
            {item ? "Update the details of this menu item." : "Add a new item to your menu."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                className={errors.price ? "border-destructive" : ""}
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category_id} onValueChange={handleSelectChange}>
                <SelectTrigger className={errors.category_id ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && <p className="text-xs text-destructive">{errors.category_id}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Image</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className={errors.image_url ? "border-destructive" : ""}
                />
                {isUploading && <p className="text-sm">Uploading...</p>}
              </div>
              {formData.image_url && (
                <div className="mt-2 h-20 w-20 overflow-hidden rounded-md">
                  <img
                    src={formData.image_url || "/placeholder.svg"}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              {errors.image_url && <p className="text-xs text-destructive">{errors.image_url}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {item ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
