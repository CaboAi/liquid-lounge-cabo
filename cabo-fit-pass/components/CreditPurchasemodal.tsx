'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Coins } from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Plan = Pick<
  Database['public']['Tables']['plans']['Row'],
  'id' | 'name' | 'credits' | 'price_cents' | 'stripe_price_id'
>

type CreditPurchaseModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function CreditPurchaseModal({ isOpen, onClose }: CreditPurchaseModalProps) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const supabase = createClient()
    supabase
      .from('plans')
      .select('id, name, credits, price_cents, stripe_price_id')
      .eq('is_active', true)
      .order('credits')
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError('Unable to load plans. Please try again.')
        } else {
          setPlans((data ?? []) as Plan[])
        }
        setIsLoading(false)
      })
  }, [isOpen])

  const handlePurchase = async (planId: string) => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const { url, error: checkoutError } = await response.json() as { url?: string; error?: string }
      if (checkoutError || !url) {
        setError('Unable to start checkout. Please try again.')
        return
      }
      window.location.href = url
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-orange-600" />
            Purchase Credits
          </DialogTitle>
          <DialogDescription>
            Choose a credit package to book your favorite fitness classes
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <p className="text-sm text-destructive text-center py-4">{error}</p>
        )}

        {!isLoading && !error && (
          <div className="space-y-3">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                data-testid="credit-modal-plan-card"
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => !isProcessing && handlePurchase(plan.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">{plan.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {plan.credits} credits
                      </p>
                      <p className="text-sm font-medium text-green-600">
                        ${(plan.price_cents / 100).toFixed(0)} MXN
                      </p>
                    </div>
                    <Button
                      size="sm"
                      disabled={isProcessing}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {isProcessing ? 'Processing...' : 'Buy Now'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center mt-4">
          All purchases are secure and processed via Stripe
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreditPurchaseModal
