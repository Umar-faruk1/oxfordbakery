"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Phone, Mail, Send } from "lucide-react"
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { MainNav } from "@/components/main-nav"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      toast.success("Message sent!", {
        description: "We'll get back to you as soon as possible.",
      })
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <div>
      <MainNav/>
    <div className="container mx-auto px-4 py-12">
      
      <h1 className="text-3xl font-bold mb-8 text-center">Contact Us</h1>

      <div className="grid md:grid-cols-2 gap-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
          <p className="text-gray-600 mb-8">
            Have questions about our cakes or need to place a special order? We're here to help! Fill out the form and
            we'll get back to you as soon as possible.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-[#FF7F00]/10 p-3 rounded-full">
                <MapPin className="h-6 w-6 text-[#FF7F00]" />
              </div>
              <div>
                <h3 className="font-semibold">Our Location</h3>
                <p className="text-gray-600">Old Midway, Before Two Sister Fast food</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-[#FF7F00]/10 p-3 rounded-full">
                <Phone className="h-6 w-6 text-[#FF7F00]" />
              </div>
              <div>
                <h3 className="font-semibold">Phone Number</h3>
                <p className="text-gray-600">(+233) 208 544 128</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-[#FF7F00]/10 p-3 rounded-full">
                <Mail className="h-6 w-6 text-[#FF7F00]" />
              </div>
              <div>
                <h3 className="font-semibold">Email Address</h3>
                <p className="text-gray-600">info@oxfordbakery.com</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="bg-[#FF7F00]/10 p-3 rounded-full hover:bg-[#FF7F00]/20 transition-colors">
                <FaFacebook className="h-6 w-6 text-[#FF7F00]" />
              </a>
              <a href="#" className="bg-[#FF7F00]/10 p-3 rounded-full hover:bg-[#FF7F00]/20 transition-colors">
                <FaInstagram className="h-6 w-6 text-[#FF7F00]" />
              </a>
              <a href="#" className="bg-[#FF7F00]/10 p-3 rounded-full hover:bg-[#FF7F00]/20 transition-colors">
                <FaTwitter className="h-6 w-6 text-[#FF7F00]" />
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-lg shadow-md p-6"
        >
          <h2 className="text-2xl font-bold mb-6">Send a Message</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="min-h-[150px]"
                required
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" className="w-full bg-[#FF7F00] hover:bg-[#FF7F00]/90 gap-2" disabled={isSubmitting}>
              <Send className="h-4 w-4" />
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
    </div>
  )
} 