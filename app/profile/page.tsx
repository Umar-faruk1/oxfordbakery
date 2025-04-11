"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Camera, Loader2, User } from "lucide-react"

import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth"
import { useSupabase } from "@/components/supabase-provider"
import { toast } from "sonner"

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const { supabase } = useSupabase()
  const router = useRouter()

  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    avatar_url: "",
  })
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      fetchProfile()
    }
  }, [user, isLoading, router])

  const fetchProfile = async () => {
    setIsLoadingProfile(true)
    try {
      const { data, error } = await supabase
        .from("users")
        .select("username, email, avatar_url")
        .eq("id", user?.id || "")
        .single()

      if (error) throw error

      setProfileData({
        username: data.username || "",
        email: data.email || user?.email || "",
        avatar_url: data.avatar_url || "",
      })
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    setIsUploading(true)

    try {
      // Check if user is authenticated
      if (!user) {
        throw new Error("You must be logged in to upload an avatar")
      }

      // Generate a unique file name
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `avatars/${user.id}/${fileName}`

      console.log("Attempting to upload file:", {
        path: filePath,
        size: file.size,
        type: file.type,
        userId: user.id
      })

      // Upload to Supabase Storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("images")
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error("Upload error details:", {
          message: uploadError.message,
          name: uploadError.name,
          status: uploadError.status,
          statusText: uploadError.statusText
        })
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      console.log("Upload successful:", uploadData)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(filePath)

      if (!urlData?.publicUrl) {
        throw new Error("Failed to get public URL")
      }

      console.log("Public URL obtained:", urlData.publicUrl)

      // Update profile data
      setProfileData((prev) => ({ ...prev, avatar_url: urlData.publicUrl }))

      // Update user profile in database
      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", user.id)

      if (updateError) {
        console.error("Database update error:", updateError)
        throw new Error(`Database update failed: ${updateError.message}`)
      }

      toast.success("Profile picture updated")
    } catch (error: any) {
      console.error("Error uploading avatar:", error)
      toast.error(error.message || "Failed to upload profile picture")
    } finally {
      setIsUploading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const { error } = await supabase.from("users").update({ username: profileData.username }).eq("id", user?.id || "")

      if (error) throw error

      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || isLoadingProfile) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 py-12">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="mb-8 text-3xl font-bold">My Profile</h1>

            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="orders">Order History</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <div className="grid gap-8 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>Update your personal information</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleProfileUpdate}>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={profileData.username}
                            onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" value={profileData.email} disabled />
                          <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button type="submit" disabled={isSaving}>
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Picture</CardTitle>
                      <CardDescription>Update your profile picture</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={profileData.avatar_url} />
                          <AvatarFallback>
                            <User className="h-12 w-12" />
                          </AvatarFallback>
                        </Avatar>

                        <div className="relative">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            disabled={isUploading}
                            className="hidden"
                            id="avatar-upload"
                          />
                          <Label
                            htmlFor="avatar-upload"
                            className="flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Camera className="h-4 w-4" />
                                Upload Picture
                              </>
                            )}
                          </Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="orders">
                <OrderHistory />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function OrderHistory() {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_number")
        .eq("user_id", user?.id || "")
        .order("created_at", { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Failed to load order history")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500/20 text-green-600"
      case "processing":
        return "bg-blue-500/20 text-blue-600"
      case "pending":
        return "bg-yellow-500/20 text-yellow-600"
      case "cancelled":
        return "bg-red-500/20 text-red-600"
      default:
        return "bg-gray-500/20 text-gray-600"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="mb-4 text-muted-foreground">You haven&apos;t placed any orders yet.</p>
          <Button onClick={() => router.push("/menu")}>Browse Menu</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <CardTitle>Order #{order.order_number}</CardTitle>
                  <CardDescription>{new Date(order.created_at).toLocaleString()}</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => router.push(`/orders/${order.id}`)}>
                    View Details
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-4">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Address:</p>
                  <p className="text-sm">{order.delivery_address}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total:</p>
                  <p className="text-lg font-bold">{formatCurrency(order.total)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
