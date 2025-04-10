"use client"

import type React from "react"

import { useEffect, useState, createContext, useContext } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useSupabase } from "@/components/supabase-provider"
import type { User } from "@supabase/supabase-js"
import { Loader2 } from "lucide-react"

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  resendConfirmationEmail: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id)
      
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          try {
            // Check if user is admin
            const { data, error } = await supabase
              .from("users")
              .select("role")
              .eq("id", session.user.id)
              .maybeSingle()
            
            if (error) {
              console.error("Error fetching user role:", error)
            }
            
            setIsAdmin(data?.role === "admin")
          } catch (error) {
            console.error("Error in auth state change:", error)
          }
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setIsAdmin(false)
      }
      
      setIsLoading(false)
    })

    // Initial session check
    const initializeAuth = async () => {
      setIsLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Check if user is admin
          const { data } = await supabase
            .from("users")
            .select("role")
            .eq("id", session.user.id)
            .maybeSingle()
          
          setIsAdmin(data?.role === "admin")
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error)
        // Check if the error is due to email not being confirmed
        if (error.message.includes("Email not confirmed") || error.message.includes("Invalid login credentials")) {
          throw new Error("Email not confirmed. Please check your inbox for the confirmation email.")
        }
        throw error
      }

      if (!data.user) {
        throw new Error("No user data received")
      }

      // Check if user exists in the users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single()

      if (userError) {
        console.error("Error fetching user role:", userError)
        throw new Error("Failed to fetch user data")
      }

      // Set admin status based on role
      setIsAdmin(userData?.role === "admin")
      
      // Set user data
      setUser(data.user)
      
      toast.success("Signed in successfully!")
      
      // Redirect based on role
      if (userData?.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/")
      }
    } catch (error: any) {
      console.error("Sign in error:", error)
      toast.error(error.message || "Failed to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // For development purposes, we'll disable email confirmation
      // In production, you might want to enable it
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
          // Set this to false to disable email confirmation requirement
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Create user profile in the users table
        // For development: Check if this is the first user to make them admin
        const { count } = await supabase.from("users").select("*", { count: "exact", head: true })
        const role = count === 0 ? "admin" : "user" // First user becomes admin

        await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email!,
          username,
          role,
        } as any)
      }

      // Check if email confirmation is required
      if (data.session) {
        // User is automatically signed in (email confirmation not required)
        toast.success("Account created successfully!")
        router.push("/")
      } else {
        // Email confirmation is required
        toast.success("Account created! Please check your email to confirm your account.")
        router.push("/login?email=" + encodeURIComponent(email))
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create account")
    }
  }

  const resendConfirmationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      toast.success("Confirmation email resent. Please check your inbox.")
    } catch (error: any) {
      toast.error(error.message || "Failed to resend confirmation email")
    }
  }

  const signOut = async () => {
    try {
      // Clear local state first
      setUser(null)
      setIsAdmin(false)
      
      // Check if there's an active session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // No active session, just clear local state and redirect
        localStorage.removeItem('supabase.auth.token')
        toast.success("Signed out successfully")
        router.push("/")
        return
      }

      // If there is a session, attempt to sign out
      const { error } = await supabase.auth.signOut({
        scope: 'local'
      })

      if (error) {
        throw error
      }

      // Clear any stored data
      localStorage.removeItem('supabase.auth.token')
      
      toast.success("Signed out successfully")
      router.push("/")
    } catch (error: any) {
      console.error("Sign out error:", error)
      // Even if there's an error, ensure local state is cleared
      setUser(null)
      setIsAdmin(false)
      localStorage.removeItem('supabase.auth.token')
      toast.error("Failed to sign out properly, but you have been logged out locally")
      router.push("/")
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw error
      }

      toast.success("Password reset email sent. Please check your inbox.")
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email")
    }
  }

  const value = {
    user,
    isAdmin,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    resendConfirmationEmail,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used inside AuthProvider")
  }
  return context
}
