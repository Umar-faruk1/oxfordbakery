"use client"

import { motion } from "framer-motion"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">About Oxford Bakery</h1>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          <p className="text-gray-600 mb-4">
            Oxford Bakery was founded in 2010 by master pastry chef Emma Oxford with a simple mission: to create
            delicious, handcrafted cakes that bring joy to every celebration.
          </p>
          <p className="text-gray-600 mb-4">
            What started as a small bakery with just three employees has grown into a beloved institution in our
            community, known for our attention to detail, premium ingredients, and exceptional customer service.
          </p>
          <p className="text-gray-600">
            Over the years, we've had the privilege of being part of thousands of special moments – from birthdays and
            weddings to graduations and anniversaries. Each cake we create is made with passion, creativity, and a
            commitment to excellence.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative h-[400px] rounded-lg overflow-hidden"
        >
          <img
            src="/placeholder.svg?height=800&width=600"
            alt="Oxford Bakery Story"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-[#FF7F00]/5 rounded-lg p-8 mb-16"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Our Mission & Values</h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-3 text-[#FF7F00]">Quality</h3>
            <p className="text-gray-600">
              We use only the finest ingredients, sourced locally whenever possible, to create cakes that taste as good
              as they look.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-3 text-[#FF7F00]">Creativity</h3>
            <p className="text-gray-600">
              We believe in pushing the boundaries of cake design, constantly innovating and creating unique,
              personalized experiences for our customers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-3 text-[#FF7F00]">Community</h3>
            <p className="text-gray-600">
              We're proud to be part of our local community and strive to give back through charitable initiatives and
              sustainable practices.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold mb-8 text-center">Meet Our Team</h2>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              name: "Emma Oxford",
              role: "Founder & Head Baker",
              image: "/placeholder.svg?height=400&width=400",
            },
            {
              name: "James Wilson",
              role: "Executive Pastry Chef",
              image: "/placeholder.svg?height=400&width=400",
            },
            {
              name: "Sophia Chen",
              role: "Cake Designer",
              image: "/placeholder.svg?height=400&width=400",
            },
            {
              name: "Michael Rodriguez",
              role: "Customer Experience Manager",
              image: "/placeholder.svg?height=400&width=400",
            },
          ].map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-white rounded-lg overflow-hidden shadow-md"
            >
              <div className="relative h-64 w-full">
                <img
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-bold text-lg">{member.name}</h3>
                <p className="text-[#FF7F00]">{member.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
} 