'use client'

import { useState } from 'react'
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Info,
  Plus,
  History,
  AlertCircle,
  CheckCircle,
  Gift
} from 'lucide-react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import type { UserCredits, CreditTransaction } from '@/types/database.types'

interface CreditBalanceProps {
  credits: UserCredits
  transactions?: CreditTransaction[]
  monthlyAllocation?: number
  onPurchaseCredits?: () => void
  onViewHistory?: () => void
  loading?: boolean
  className?: string
}

export function CreditBalance({ 
  credits,
  transactions = [],
  monthlyAllocation = 4,
  onPurchaseCredits,
  onViewHistory,
  loading = false,
  className 
}: CreditBalanceProps) {
  const [showDetails, setShowDetails] = useState(false)
  
  // Calculate progress percentage (assuming max display of 20 credits)
  const maxDisplayCredits = 20
  const progressPercentage = Math.min((credits.current_balance / maxDisplayCredits) * 100, 100)
  
  // Get credit status color
  const getCreditStatusColor = () => {
    if (credits.current_balance === 0) return 'text-red-600'
    if (credits.current_balance <= 2) return 'text-yellow-600'
    return 'text-green-600'
  }
  
  // Get progress bar color
  const getProgressBarClass = () => {
    if (credits.current_balance === 0) return 'bg-red-500'
    if (credits.current_balance <= 2) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  // Calculate recent activity
  const recentTransactions = transactions.slice(0, 3)
  const thisMonthSpent = transactions
    .filter(t => {
      const transactionDate = new Date(t.created_at)
      const now = new Date()
      return t.type === 'debit' && 
        transactionDate.getMonth() === now.getMonth() &&
        transactionDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, t) => sum + t.amount, 0)

  const thisMonthEarned = transactions
    .filter(t => {
      const transactionDate = new Date(t.created_at)
      const now = new Date()
      return t.type === 'credit' && 
        transactionDate.getMonth() === now.getMonth() &&
        transactionDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, t) => sum + t.amount, 0)

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="h-2 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Credit Balance
            </CardTitle>
            <CardDescription>
              Manage your class credits
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View credit details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Balance */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className={cn("text-4xl font-bold", getCreditStatusColor())}>
                {credits.current_balance}
              </span>
              <span className="text-sm text-muted-foreground">credits</span>
            </div>
            {credits.current_balance <= 2 && credits.current_balance > 0 && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                Low Balance
              </Badge>
            )}
            {credits.current_balance === 0 && (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                No Credits
              </Badge>
            )}
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="h-3"
            indicatorClassName={getProgressBarClass()}
          />
          
          <p className="text-xs text-muted-foreground">
            {credits.current_balance} of {maxDisplayCredits} credits shown
          </p>
        </div>

        {/* Quick Stats */}
        {showDetails && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span>This Month Earned</span>
                </div>
                <p className="text-lg font-semibold">{thisMonthEarned}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span>This Month Used</span>
                </div>
                <p className="text-lg font-semibold">{thisMonthSpent}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Lifetime Stats</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Earned:</span>
                  <span className="font-medium">{credits.lifetime_earned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Used:</span>
                  <span className="font-medium">{credits.lifetime_spent}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Monthly Allocation Notice */}
        <Alert className="border-blue-200 bg-blue-50">
          <Gift className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-sm font-medium text-blue-900">
            Monthly Credits
          </AlertTitle>
          <AlertDescription className="text-xs text-blue-800">
            You receive {monthlyAllocation} free credits at the start of each month.
            Next allocation in {getDaysUntilNextMonth()} days.
          </AlertDescription>
        </Alert>

        {/* Low Balance Warning */}
        {credits.current_balance <= 2 && credits.current_balance > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-sm font-medium text-yellow-900">
              Running Low on Credits
            </AlertTitle>
            <AlertDescription className="text-xs text-yellow-800">
              You only have {credits.current_balance} credit{credits.current_balance !== 1 ? 's' : ''} remaining. 
              Purchase more to continue booking classes.
            </AlertDescription>
          </Alert>
        )}

        {/* No Credits Alert */}
        {credits.current_balance === 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-sm font-medium text-red-900">
              No Credits Available
            </AlertTitle>
            <AlertDescription className="text-xs text-red-800">
              You need credits to book classes. Purchase credits now or wait for your monthly allocation.
            </AlertDescription>
          </Alert>
        )}

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && showDetails && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Recent Activity</p>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onViewHistory}
                  className="h-7 text-xs"
                >
                  View All
                </Button>
              </div>
              <div className="space-y-2">
                {recentTransactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {transaction.type === 'credit' ? (
                        <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                          <Plus className="h-3 w-3 text-green-600" />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium line-clamp-1">
                          {transaction.description || (transaction.type === 'credit' ? 'Credits Added' : 'Class Booking')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTransactionDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "font-medium",
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {transaction.type === 'credit' ? '+' : '-'}{transaction.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-2">
        <Button 
          className="flex-1" 
          onClick={onPurchaseCredits}
          variant={credits.current_balance === 0 ? 'default' : 'outline'}
        >
          <Plus className="h-4 w-4 mr-2" />
          Buy Credits
        </Button>
        <Button 
          variant="outline"
          onClick={onViewHistory}
        >
          <History className="h-4 w-4 mr-2" />
          History
        </Button>
      </CardFooter>
    </Card>
  )
}

function getDaysUntilNextMonth(): number {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const diffTime = Math.abs(nextMonth.getTime() - now.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

function formatTransactionDate(date: string): string {
  const transactionDate = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - transactionDate.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return transactionDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
}