"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, Search, Plus, Minus } from "lucide-react"

import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useSupabase } from "@/components/supabase-provider"
import { useCart } from "@/lib/cart"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

export default function MenuPage() {
  const { supabase } = useSupabase()
  const { addItem, removeItem, updateQuantity, items: cartItems } = useCart()
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")

  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .order("name")

        if (categoriesError) throw categoriesError
        setCategories(categoriesData || [])

        // Fetch menu items
        const { data: menuData, error: menuError } = await supabase
          .from("menu_items")
          .select(`
            *,
            categories(name)
          `)
          .order("name")

        if (menuError) throw menuError
        
        if (!menuData || menuData.length === 0) {
          console.log("No menu items found")
        }
        
        setMenuItems(menuData || [])
        setFilteredItems(menuData || [])
      } catch (error: any) {
        console.error("Error fetching data:", error)
        setError(error.message)
        toast.error("Failed to load menu items")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  useEffect(() => {
    // Set active category from URL parameter if present
    if (categoryParam) {
      setActiveCategory(categoryParam)
    }
  }, [categoryParam])

  useEffect(() => {
    // Filter items based on active category and search query
    let filtered = [...menuItems]

    if (activeCategory !== "all") {
      filtered = filtered.filter((item) => item.categories?.name?.toLowerCase() === activeCategory.toLowerCase())
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) => 
          item.name?.toLowerCase().includes(query) || 
          item.description?.toLowerCase().includes(query)
      )
    }

    setFilteredItems(filtered)
  }, [activeCategory, searchQuery, menuItems])

  const isInCart = (itemId: number) => {
    return cartItems.some(item => item.id === itemId)
  }

  const getItemQuantity = (itemId: number) => {
    return cartItems.find(item => item.id === itemId)?.quantity || 0
  }

  const handleCartAction = (item: any, action: 'add' | 'remove') => {
    const currentQuantity = getItemQuantity(item.id)
    
    if (action === 'add') {
      if (isInCart(item.id)) {
        // Update quantity if item exists
        updateQuantity(item.id, currentQuantity + 1)
        toast.success(`Added another ${item.name}`)
      } else {
        // Add new item with quantity 1
        addItem({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image_url,
          quantity: 1,
        })
        toast.success(`Added ${item.name} to cart`)
      }
    } else {
      if (currentQuantity > 1) {
        // Decrease quantity if more than 1
        updateQuantity(item.id, currentQuantity - 1)
        toast.success(`Removed one ${item.name}`)
      } else {
        // Remove item if quantity would be 0
        removeItem(item.id)
        toast.success(`Removed ${item.name} from cart`)
      }
    }
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h2 className="mb-2 text-2xl font-bold text-destructive">Error Loading Menu</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <section className="bg-muted py-12">
          <div className="container">
            <h1 className="text-center text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Oxford Bakery Menu</h1>
            <p className="mx-auto mt-4 max-w-[700px] text-center text-muted-foreground">
              Browse our selection of delicious cakes and pastries for every occasion.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Tabs
                defaultValue={activeCategory}
                value={activeCategory}
                onValueChange={setActiveCategory}
                className="w-full sm:w-auto"
              >
                <TabsList className="flex w-full flex-wrap sm:w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  {categories.map((category) => (
                    <TabsTrigger key={category.id} value={category.name.toLowerCase()}>
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search cakes..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
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
                    <Card className="group h-full overflow-hidden">
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={item.image_url || "/placeholder.svg?height=200&width=300"}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                          }}
                        />
                      </div>
                      <CardHeader>
                        <CardTitle>{item.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{item.description}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <p className="text-lg font-bold">{formatCurrency(item.price)}</p>
                          <div className="flex items-center gap-2">
                            {isInCart(item.id) && (
                              <motion.button
                                onClick={() => handleCartAction(item, 'remove')}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF7F00] text-white shadow-lg transition-all duration-300 hover:bg-[#FF7F00]/90"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              >
                                <Minus className="h-4 w-4" />
                              </motion.button>
                            )}
                            {isInCart(item.id) && (
                              <span className="w-6 text-center font-medium">
                                {getItemQuantity(item.id)}
                              </span>
                            )}
                            <motion.button
                              onClick={() => handleCartAction(item, 'add')}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF7F00] text-white shadow-lg transition-all duration-300 hover:bg-[#FF7F00]/90"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Plus className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </div>
                        <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          {item.categories?.name}
                        </span>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-center text-lg text-muted-foreground">No items found.</p>
                {searchQuery && (
                  <Button className="mt-4" variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
