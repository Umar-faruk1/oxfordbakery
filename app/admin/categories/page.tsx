"use client"

import { useState, useEffect } from "react"
import { Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdminHeader } from "@/components/admin/admin-header"
import { useSupabase } from "@/components/supabase-provider"
import { toast } from "sonner"
import { CategoryDialog } from "@/components/admin/category-dialog"

interface Category {
  id: number
  name: string
  created_at: string
}

export default function AdminCategoriesPage() {
  const { supabase } = useSupabase()
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      setFilteredCategories(categories.filter((category) => category.name.toLowerCase().includes(query)))
    } else {
      setFilteredCategories(categories)
    }
  }, [searchQuery, categories])

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name")

      if (error) throw error
      setCategories(data || [])
      setFilteredCategories(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Failed to load categories")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCategory = () => {
    setCurrentCategory(null)
    setIsDialogOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category)
    setIsDialogOpen(true)
  }

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category? This will affect all menu items in this category.")) {
      return
    }

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id)

      if (error) throw error

      toast.success("Category deleted successfully")
      fetchCategories()
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error("Failed to delete category. It may be in use by menu items.")
    }
  }

  const handleSaveCategory = async (name: string) => {
    try {
      if (currentCategory) {
        // Update existing category
        const { error } = await supabase.from("categories").update({ name }).eq("id", currentCategory.id)

        if (error) throw error
        toast.success("Category updated successfully")
      } else {
        // Create new category
        const { error } = await supabase.from("categories").insert({ name })

        if (error) throw error
        toast.success("Category created successfully")
      }

      fetchCategories()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving category:", error)
      toast.error("Failed to save category")
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <AdminHeader
        title="Categories"
        description="Manage cake categories"
        action={{
          label: "Add Category",
          onClick: handleAddCategory,
        }}
      />

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="h-4 w-[200px] animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-[150px] animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <div className="h-8 w-8 animate-pulse rounded bg-muted" />
                      <div className="h-8 w-8 animate-pulse rounded bg-muted" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditCategory(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No categories found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        category={currentCategory}
        onSave={handleSaveCategory}
      />
    </div>
  )
}
