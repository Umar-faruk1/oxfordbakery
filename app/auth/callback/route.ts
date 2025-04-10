import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Create a singleton instance for the route handler
let supabaseClient: ReturnType<typeof createRouteHandlerClient> | null = null

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    
    // Use the singleton instance if available
    if (!supabaseClient) {
      supabaseClient = createRouteHandlerClient({ cookies: () => cookieStore })
    }
    
    await supabaseClient.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin)
}
