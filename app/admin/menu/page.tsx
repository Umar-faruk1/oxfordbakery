"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AdminHeader } from "@/components/admin/admin-header"
import { useSupabase } from "@/components/supabase-provider"
import { toast } from "sonner"
import { MenuItemDialog } from "@/components/admin/menu-item-dialog"

interface MenuItem {
  id: number
  name: string
  price: number
  description: string
  category_id: number
  image_url: string
  categories: {
    name: string
  }
}

export default function AdminMenuPage() {
  const { supabase } = useSupabase()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null)

  useEffect(() => {
    fetchMenuItems()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      setFilteredItems(
        menuItems.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.categories.name.toLowerCase().includes(query),
        ),
      )
    } else {
      setFilteredItems(menuItems)
    }
  }, [searchQuery, menuItems])

  const fetchMenuItems = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select(`
          *,
          categories (
            name
          )
        `)
        .order("name")

      if (error) throw error
      setMenuItems(data || [])
      setFilteredItems(data || [])
    } catch (error) {
      console.error("Error fetching menu items:", error)
      toast.error("Failed to load menu items")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddItem = () => {
    setCurrentItem(null)
    setIsDialogOpen(true)
  }

  const handleEditItem = (item: MenuItem) => {
    setCurrentItem(item)
    setIsDialogOpen(true)
  }

  const handleDeleteItem = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return
    }

    try {
      const { error } = await supabase.from("menu_items").delete().eq("id", id)

      if (error) throw error

      toast.success("Item deleted successfully")
      fetchMenuItems()
    } catch (error) {
      console.error("Error deleting menu item:", error)
      toast.error("Failed to delete item")
    }
  }

  const handleSaveItem = async (item: any) => {
    try {
      if (currentItem) {
        // Update existing item
        const { error } = await supabase
          .from("menu_items")
          .update({
            name: item.name,
            price: item.price,
            description: item.description,
            category_id: item.category_id,
            image_url: item.image_url,
          })
          .eq("id", currentItem.id)

        if (error) throw error
        toast.success("Item updated successfully")
      } else {
        // Create new item
        const { error } = await supabase.from("menu_items").insert({
          name: item.name,
          price: item.price,
          description: item.description,
          category_id: item.category_id,
          image_url: item.image_url,
        })

        if (error) throw error
        toast.success("Item created successfully")
      }

      fetchMenuItems()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving menu item:", error)
      toast.error("Failed to save item")
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <AdminHeader
        title="Menu Management"
        description="Add, edit, and manage your cake menu"
        action={{
          label: "Add Item",
          onClick: handleAddItem,
        }}
      />

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="h-[400px] animate-pulse">
              <div className="aspect-video bg-muted" />
              <CardHeader>
                <div className="h-6 w-2/3 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-4/5 rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="h-full overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={item.image_url || "/placeholder.svg?height=200&width=300"}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-lg font-bold">GH₵{item.price.toFixed(2)}</p>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {item.categories.name}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="icon" onClick={() => handleEditItem(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-center text-muted-foreground">No menu items found matching your criteria.</p>
          <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
            Reset Search
          </Button>
        </div>
      )}

      <MenuItemDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} item={currentItem} onSave={handleSaveItem} />
    </div>
  )
}
