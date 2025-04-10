"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <div className="relative min-h-[80vh] w-full overflow-hidden bg-[url('/hero-bg.jpg')] bg-cover bg-fixed bg-center bg-no-repeat">
      {/* Dark overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
      
      {/* Content */}
      <div className="container relative z-10 flex min-h-[80vh] items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-4 text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl"
          >
            Delicious Cakes
            <br />
            Delivered to Your
            <br />
            <span className="text-orange-400">Doorstep!</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8 max-w-xl text-lg text-gray-200"
          >
            Handcrafted with love, our cakes are made with the finest
            ingredients for every special occasion.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link href="/menu">
              <Button 
                size="lg" 
                className="bg-orange-500 px-8 py-6 text-lg font-semibold tracking-wide text-white hover:bg-orange-600"
              >
                View Menu
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent"
      />
    </div>
  )
}