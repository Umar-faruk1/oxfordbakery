"use client"

import type React from "react"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Cake } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth"

export default function LoginPage() {
  const { signIn, resetPassword, resendConfirmationEmail, isLoading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get("email")

  const [email, setEmail] = useState(emailParam || "")
  const [password, setPassword] = useState("")
  const [isResetMode, setIsResetMode] = useState(false)
  const [showConfirmationAlert, setShowConfirmationAlert] = useState(!!emailParam)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isResetMode) {
        await resetPassword(email)
      } else {
        await signIn(email, password)
      }
    } catch (error) {
      // Error is already handled in the auth hook
      console.error("Login error:", error)
    }
  }

  const handleResendConfirmation = async () => {
    if (!email) return
    await resendConfirmationEmail(email)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="mb-4 flex flex-col items-center text-center">
          <Link href="/" className="mb-2 flex items-center space-x-2">
            <Cake className="h-8 w-8" />
            <span className="text-2xl font-bold">Oxford Bakery</span>
          </Link>
        </div>

        {showConfirmationAlert && (
          <Alert className="mb-4">
            <AlertDescription>
              Please check your email to confirm your account before logging in.
              <Button variant="link" className="h-auto p-0 pl-1" onClick={handleResendConfirmation}>
                Resend confirmation email
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{isResetMode ? "Reset Password" : "Login"}</CardTitle>
            <CardDescription>
              {isResetMode
                ? "Enter your email to receive a password reset link"
                : "Enter your credentials to access your account"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {!isResetMode && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 text-xs"
                      onClick={() => setIsResetMode(true)}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={authLoading}>
                {authLoading ? "Loading..." : isResetMode ? "Send Reset Link" : "Sign In"}
              </Button>

              {isResetMode ? (
                <Button type="button" variant="link" className="w-full" onClick={() => setIsResetMode(false)}>
                  Back to login
                </Button>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </p>
              )}
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
