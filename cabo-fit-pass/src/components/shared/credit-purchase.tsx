'use client'

import { useState } from 'react'
import {
  CreditCard,
  Package,
  Gift,
  Zap,
  Check,
  X,
  AlertCircle,
  Loader2,
  Star,
  TrendingUp
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  originalPrice?: number
  popular?: boolean
  bonus?: number
  description: string
  features: string[]
  validityDays?: number
}

interface CreditPurchaseProps {
  currentBalance?: number
  onPurchase?: (packageId: string, paymentMethod: string) => Promise<void>
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  loading?: boolean
}

export function CreditPurchase({
  currentBalance = 0,
  onPurchase,
  children,
  open,
  onOpenChange,
  loading = false
}: CreditPurchaseProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('card')
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const creditPackages: CreditPackage[] = [
    {
      id: 'starter',
      name: 'Starter Pack',
      credits: 5,
      price: 49.99,
      description: 'Perfect for trying out different classes',
      features: ['5 class credits', 'Valid for 30 days', 'All class types included'],
      validityDays: 30
    },
    {
      id: 'value',
      name: 'Value Pack',
      credits: 10,
      price: 89.99,
      originalPrice: 99.99,
      bonus: 1,
      popular: true,
      description: 'Most popular choice for regular members',
      features: ['10 class credits', '+1 bonus credit', 'Valid for 60 days', 'Priority booking'],
      validityDays: 60
    },
    {
      id: 'premium',
      name: 'Premium Pack',
      credits: 20,
      price: 159.99,
      originalPrice: 199.99,
      bonus: 3,
      description: 'Best value for fitness enthusiasts',
      features: ['20 class credits', '+3 bonus credits', 'Valid for 90 days', 'Priority booking', 'Free guest passes (2)'],
      validityDays: 90
    },
    {
      id: 'unlimited',
      name: 'Unlimited Monthly',
      credits: 999, // Represents unlimited
      price: 199.99,
      description: 'Unlimited access to all classes',
      features: ['Unlimited class access', 'Valid for 30 days', 'Priority booking', 'Free guest passes (5)', 'Personal trainer session (1)'],
      validityDays: 30
    }
  ]

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
    { id: 'apple', name: 'Apple Pay', icon: Package },
    { id: 'google', name: 'Google Pay', icon: Package },
  ]

  const selectedPkg = creditPackages.find(pkg => pkg.id === selectedPackage)

  const calculateTotal = () => {
    if (!selectedPkg) return 0
    let total = selectedPkg.price
    if (promoApplied) {
      total *= 0.9 // 10% discount
    }
    return total
  }

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === 'welcome10') {
      setPromoApplied(true)
      toast.success('Promo code applied!', {
        description: '10% discount has been applied to your order.'
      })
    } else {
      toast.error('Invalid promo code', {
        description: 'Please check your promo code and try again.'
      })
    }
  }

  const handlePurchase = async () => {
    if (!selectedPkg || !paymentMethod) {
      toast.error('Please select a package and payment method')
      return
    }

    setIsProcessing(true)
    try {
      if (onPurchase) {
        await onPurchase(selectedPackage, paymentMethod)
      }
      
      toast.success('Credits purchased successfully!', {
        description: `${selectedPkg.credits}${selectedPkg.bonus ? ' + ' + selectedPkg.bonus : ''} credits added to your account.`
      })
      
      onOpenChange?.(false)
    } catch (error) {
      toast.error('Purchase failed', {
        description: 'Please try again or contact support.'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getPricePerCredit = (pkg: CreditPackage) => {
    const totalCredits = pkg.credits + (pkg.bonus || 0)
    return (pkg.price / totalCredits).toFixed(2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Purchase Credits
          </DialogTitle>
          <DialogDescription>
            Choose a credit package to continue booking classes. You currently have {currentBalance} credits.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Credit Packages */}
          <div className="space-y-3">
            <h3 className="font-semibold">Select Credit Package</h3>
            <RadioGroup 
              value={selectedPackage} 
              onValueChange={setSelectedPackage}
              className="grid gap-3 sm:grid-cols-2"
            >
              {creditPackages.map((pkg) => (
                <div key={pkg.id} className="relative">
                  <RadioGroupItem 
                    value={pkg.id} 
                    id={pkg.id} 
                    className="peer sr-only" 
                  />
                  <Label
                    htmlFor={pkg.id}
                    className={cn(
                      "flex flex-col h-full p-4 rounded-lg border-2 cursor-pointer transition-all",
                      "peer-checked:border-primary peer-checked:bg-primary/5",
                      "hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{pkg.name}</h4>
                          {pkg.popular && (
                            <Badge variant="default" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {pkg.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-bold">
                        ${pkg.price.toFixed(2)}
                      </span>
                      {pkg.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${pkg.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        {pkg.credits === 999 ? (
                          <span className="text-lg font-semibold text-primary">
                            ∞ Unlimited
                          </span>
                        ) : (
                          <>
                            <span className="text-lg font-semibold">
                              {pkg.credits}
                            </span>
                            {pkg.bonus && (
                              <span className="text-sm text-green-600 font-medium">
                                +{pkg.bonus} bonus
                              </span>
                            )}
                            <span className="text-sm text-muted-foreground">
                              credits
                            </span>
                          </>
                        )}
                      </div>
                      {pkg.credits !== 999 && (
                        <Badge variant="outline" className="text-xs">
                          ${getPricePerCredit(pkg)}/credit
                        </Badge>
                      )}
                    </div>

                    <ul className="space-y-1 text-xs text-muted-foreground flex-1">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {pkg.validityDays && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Valid for {pkg.validityDays} days
                      </p>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {selectedPkg && (
            <>
              <Separator />

              {/* Payment Method */}
              <div className="space-y-3">
                <h3 className="font-semibold">Payment Method</h3>
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={setPaymentMethod}
                  className="grid gap-2"
                >
                  {paymentMethods.map((method) => {
                    const Icon = method.icon
                    return (
                      <div key={method.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={method.id} id={method.id} />
                        <Label htmlFor={method.id} className="flex items-center gap-2 cursor-pointer">
                          <Icon className="h-4 w-4" />
                          {method.name}
                        </Label>
                      </div>
                    )
                  })}
                </RadioGroup>
              </div>

              <Separator />

              {/* Promo Code */}
              <div className="space-y-3">
                <h3 className="font-semibold">Promo Code</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleApplyPromo}
                    disabled={!promoCode || promoApplied}
                  >
                    {promoApplied ? <Check className="h-4 w-4" /> : 'Apply'}
                  </Button>
                </div>
                {promoApplied && (
                  <Alert className="border-green-200 bg-green-50">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Promo code applied! You saved ${(selectedPkg.price * 0.1).toFixed(2)}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Separator />

              {/* Order Summary */}
              <div className="space-y-3">
                <h3 className="font-semibold">Order Summary</h3>
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between">
                      <span>{selectedPkg.name}</span>
                      <span>${selectedPkg.price.toFixed(2)}</span>
                    </div>
                    {selectedPkg.bonus && (
                      <div className="flex justify-between text-green-600">
                        <span>Bonus credits</span>
                        <span>+{selectedPkg.bonus}</span>
                      </div>
                    )}
                    {promoApplied && (
                      <div className="flex justify-between text-green-600">
                        <span>Promo discount (10%)</span>
                        <span>-${(selectedPkg.price * 0.1).toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Security Notice */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your payment information is secure and encrypted. Credits will be added to your account immediately after purchase.
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handlePurchase}
            disabled={!selectedPkg || isProcessing || loading}
            className="flex-1"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4 mr-2" />
            )}
            {isProcessing 
              ? 'Processing...' 
              : `Purchase ${selectedPkg?.credits === 999 ? 'Unlimited' : (selectedPkg?.credits || 0) + (selectedPkg?.bonus || 0) + ' Credits'} - $${calculateTotal().toFixed(2)}`
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}