"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

type SupabaseContext = {
  supabase: ReturnType<typeof createClient<Database>>
}

const Context = createContext<SupabaseContext | undefined>(undefined)

// Create a singleton instance of the Supabase client
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => {
    // If we already have a client, return it
    if (supabaseClient) {
      return supabaseClient
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables. Please check your .env.local file.")
      // Return a mock client for development purposes
      supabaseClient = createClient<Database>(
        "https://example.supabase.co",
        "example-key"
      )
      return supabaseClient
    }

    // Create a new client and store it
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey)
    return supabaseClient
  })

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      // You can add additional logic here when auth state changes
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return <Context.Provider value={{ supabase }}>{children}</Context.Provider>
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider")
  }
  return context
}
