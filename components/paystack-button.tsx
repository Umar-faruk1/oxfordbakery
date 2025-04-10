"use client"

import { useState } from "react"
import { usePaystackPayment } from "react-paystack"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface PaystackButtonProps {
  email: string
  amount: number
  reference: string
  onSuccess: (reference: string) => void
  metadata?: Record<string, any>
}

export function PaystackButton({ email, amount, reference, onSuccess, metadata }: PaystackButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const config = {
    reference,
    email,
    amount,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_yourtestkeyhere",
    label: "Pay for your order",
    currency: "GHS",
    metadata: metadata ? {
      ...metadata,
      custom_fields: []
    } : undefined,
  }

  const initializePayment = usePaystackPayment(config)

  const handlePaymentInitialize = () => {
    setIsProcessing(true)
    // @ts-ignore - The type definitions for usePaystackPayment are not correct
    initializePayment({
      onSuccess: (reference: any) => {
        setIsProcessing(false)
        onSuccess(reference.reference || reference)
      },
      onClose: () => {
        setIsProcessing(false)
      },
    })
  }

  return (
    <Button className="w-full" onClick={handlePaymentInitialize} disabled={isProcessing}>
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        "Pay Now"
      )}
    </Button>
  )
}
