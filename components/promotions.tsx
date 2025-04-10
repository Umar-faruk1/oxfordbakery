"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Promotions() {
  return (
    <section className="bg-muted py-12 md:py-20">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-lg bg-card p-6 shadow-md"
          >
            <h3 className="text-2xl font-bold">Special Occasion Discount</h3>
            <p className="mt-2 text-muted-foreground">
              Get 15% off on all wedding and anniversary cakes when you order 2 weeks in advance.
            </p>
            <div className="mt-4">
              <Link href="/menu">
                <Button>Browse Wedding Cakes</Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-lg bg-card p-6 shadow-md"
          >
            <h3 className="text-2xl font-bold">Birthday Bundle</h3>
            <p className="mt-2 text-muted-foreground">
              Order a birthday cake and get a box of 6 cupcakes for free. Perfect for your celebration!
            </p>
            <div className="mt-4">
              <Link href="/menu">
                <Button>Browse Birthday Cakes</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
