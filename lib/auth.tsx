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
        if (error.message.includes("Email not confirmed")) {
          throw new Error("Please confirm your email before logging in.")
        } else if (error.message.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password.")
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
        .maybeSingle()

      if (userError && userError.code !== "PGRST116") {
        console.error("Error fetching user role:", userError)
        throw new Error("Failed to fetch user data")
      }

      // If user doesn't exist in users table, create their profile
      if (!userData) {
        const { error: createError } = await supabase
          .from("users")
          .insert({
            id: data.user.id,
            email: data.user.email!,
            username: data.user.user_metadata.username || data.user.email!.split('@')[0],
            role: "user"
          })

        if (createError) {
          console.error("Error creating user profile:", createError)
          throw new Error("Failed to create user profile")
        }

        // Set admin status to false for new users
        setIsAdmin(false)
      } else {
        // Set admin status based on role
        setIsAdmin(userData.role === "admin")
      }
      
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
    setIsLoading(true)
    try {
      // Validate input
      if (!email || !password || !username) {
        throw new Error("All fields are required")
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long")
      }

      if (username.length < 3) {
        throw new Error("Username must be at least 3 characters long")
      }

      // First, create the auth user
      const { error: signUpError, data: authData } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        if (signUpError.message.includes("User already registered")) {
          throw new Error("An account with this email already exists")
        }
        throw signUpError
      }

      if (!authData.user) {
        throw new Error("Failed to create user account")
      }

      // Create user profile using a server-side function
      const { error: profileError } = await supabase.rpc('create_user_profile', {
        user_id: authData.user.id,
        user_email: authData.user.email,
        user_username: username,
        user_role: 'user'
      })

      if (profileError) {
        console.error("Error creating user profile:", profileError)
        // If profile creation fails, we should still allow the user to sign in
        // They can update their profile later
        toast.warning("Account created, but profile setup failed. Please try logging in.")
      } else {
        toast.success("Account created successfully!")
      }

      // Check if email confirmation is required
      if (authData.session) {
        // User is automatically signed in
        setUser(authData.user)
        router.push("/")
      } else {
        // Email confirmation is required
        toast.success("Please check your email to confirm your account.")
        router.push("/login?email=" + encodeURIComponent(email))
      }
    } catch (error: any) {
      console.error("Sign up error:", error)
      toast.error(error.message || "Failed to create account")
    } finally {
      setIsLoading(false)
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
    setIsLoading(true)
    try {
      // Clear local state first
      setUser(null)
      setIsAdmin(false)
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
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
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    setIsLoading(true)
    try {
      if (!email) {
        throw new Error("Email is required")
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        if (error.message.includes("User not found")) {
          throw new Error("No account found with this email address")
        }
        throw error
      }

      toast.success("Password reset email sent. Please check your inbox.")
    } catch (error: any) {
      console.error("Reset password error:", error)
      toast.error(error.message || "Failed to send reset email")
    } finally {
      setIsLoading(false)
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
