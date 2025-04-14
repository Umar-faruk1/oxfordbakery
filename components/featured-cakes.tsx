"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/lib/cart"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

// Mock data - would come from Supabase in a real app
const featuredCakes = [
  {
    id: 1,
    name: "Chocolate Delight",
    // price: 45.99,
    image: "/chocolate.jpg",
    description: "Rich chocolate cake with ganache and chocolate shavings",
    category: "birthday",
  },
  {
    id: 2,
    name: "Strawberry Dream",
    // price: 39.99,
    image: "/wedding-cake-5629396_1280.jpg",
    description: "Light vanilla cake with fresh strawberries and cream",
    category: "wedding",
  },
  {
    id: 3,
    name: "Lemon Bliss",
    // price: 35.99,
    image: "/birthday.jpg",
    description: "Tangy lemon cake with lemon curd and buttercream",
    category: "celebration",
  },
]

export function FeaturedCakes() {
  const { addItem } = useCart()

  // const handleAddToCart = (cake: (typeof featuredCakes)[0]) => {
  //   addItem({
  //     id: cake.id,
  //     name: cake.name,
  //     price: cake.price,
  //     image: cake.image,
  //     quantity: 1,
  //   })
  //   toast.success(`${cake.name} added to cart!`)
  // }

  return (
    <section className="py-12 md:py-20">
      <div className="container">
        <div className="mb-10 flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Featured Cakes</h2>
          <p className="mt-4 max-w-[700px] text-muted-foreground">
            Our most popular cakes, loved by customers for their exceptional taste and beautiful designs.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCakes.map((cake, index) => (
            <motion.div
              key={cake.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="h-full overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={cake.image || "/placeholder.svg"}
                    alt={cake.name}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{cake.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{cake.description}</p>
                  {/* <p className="mt-2 text-lg font-bold">{formatCurrency(cake.price)}</p> */}
                </CardContent>
                <CardFooter className="flex justify-between">
                  {/* <Button variant="outline" onClick={() => handleAddToCart(cake)}>
                    Add to Cart
                  </Button> */}
                  <Link href='/menu'>
                    <Button variant="ghost" size="icon">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link href="/menu">
            <Button>
              View All Cakes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
