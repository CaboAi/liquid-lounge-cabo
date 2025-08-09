'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './use-auth'
import { credits as creditsApi } from '@/lib/supabase/browser'
import type { UserCredits, CreditTransaction } from '@/types/database.types'

interface UseCreditOptions {
  enableRealTime?: boolean
  autoRefresh?: boolean
}

export function useCredits(options: UseCreditOptions = {}) {
  const { enableRealTime = true, autoRefresh = true } = options
  const { user } = useAuth()
  const [credits, setCredits] = useState<UserCredits | null>(null)
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user credits
  const loadCredits = useCallback(async () => {
    if (!user?.id) {
      setCredits(null)
      setLoading(false)
      return
    }

    try {
      setError(null)
      const userCredits = await creditsApi.getByUserId(user.id)
      setCredits(userCredits)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load credits')
      console.error('Error loading credits:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Load transaction history
  const loadTransactions = useCallback(async (limit = 50) => {
    if (!user?.id) return

    try {
      const userTransactions = await creditsApi.getTransactionHistory(user.id, limit)
      setTransactions(userTransactions)
    } catch (err) {
      console.error('Error loading transaction history:', err)
    }
  }, [user?.id])

  // Purchase credits
  const purchaseCredits = useCallback(async (packageId: string, paymentMethod: string) => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      setLoading(true)
      const result = await creditsApi.purchaseCredits(user.id, packageId, paymentMethod)
      
      // Refresh credits after purchase
      await loadCredits()
      await loadTransactions()
      
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to purchase credits')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.id, loadCredits, loadTransactions])

  // Spend credits (for booking classes)
  const spendCredits = useCallback(async (amount: number, description: string, classId?: string) => {
    if (!user?.id) throw new Error('User not authenticated')
    if (!credits || credits.current_balance < amount) {
      throw new Error('Insufficient credits')
    }

    try {
      const transaction = await creditsApi.spendCredits(user.id, amount, description, classId)
      
      // Update local state optimistically
      setCredits(prev => prev ? {
        ...prev,
        current_balance: prev.current_balance - amount,
        lifetime_spent: prev.lifetime_spent + amount
      } : null)

      // Add transaction to local state
      setTransactions(prev => [transaction, ...prev])
      
      return transaction
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to spend credits')
      throw err
    }
  }, [user?.id, credits])

  // Add credits (for refunds or admin actions)
  const addCredits = useCallback(async (amount: number, description: string, reason?: 'purchase' | 'refund' | 'bonus' | 'admin') => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      const transaction = await creditsApi.addCredits(user.id, amount, description, reason)
      
      // Update local state optimistically
      setCredits(prev => prev ? {
        ...prev,
        current_balance: prev.current_balance + amount,
        lifetime_earned: prev.lifetime_earned + amount
      } : null)

      // Add transaction to local state
      setTransactions(prev => [transaction, ...prev])
      
      return transaction
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add credits')
      throw err
    }
  }, [user?.id])

  // Get monthly credit allocation
  const getMonthlyAllocation = useCallback(async () => {
    if (!user?.id) return null

    try {
      return await creditsApi.getMonthlyAllocation(user.id)
    } catch (err) {
      console.error('Error getting monthly allocation:', err)
      return null
    }
  }, [user?.id])

  // Check if user can afford a purchase
  const canAfford = useCallback((amount: number) => {
    return credits ? credits.current_balance >= amount : false
  }, [credits])

  // Get credit spending statistics
  const getSpendingStats = useCallback(() => {
    if (!credits || !transactions.length) return null

    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const thisMonthTransactions = transactions.filter(t => 
      new Date(t.created_at) >= thisMonth
    )

    const thisMonthSpent = thisMonthTransactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0)

    const thisMonthEarned = thisMonthTransactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      currentBalance: credits.current_balance,
      lifetimeEarned: credits.lifetime_earned,
      lifetimeSpent: credits.lifetime_spent,
      thisMonthSpent,
      thisMonthEarned,
      averageMonthlySpending: credits.lifetime_spent / Math.max(1, getAccountAgeInMonths()),
    }
  }, [credits, transactions])

  const getAccountAgeInMonths = useCallback(() => {
    if (!credits) return 1
    const created = new Date(credits.created_at)
    const now = new Date()
    const months = (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth())
    return Math.max(1, months)
  }, [credits])

  // Initialize data loading
  useEffect(() => {
    if (user?.id) {
      loadCredits()
      if (autoRefresh) {
        loadTransactions()
      }
    }
  }, [user?.id, loadCredits, loadTransactions, autoRefresh])

  // Set up real-time subscription
  useEffect(() => {
    if (!enableRealTime || !user?.id) return

    const subscription = creditsApi.subscribeToCredits(user.id, (updatedCredits) => {
      setCredits(updatedCredits)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [enableRealTime, user?.id])

  // Auto-refresh periodically
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadCredits()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, loadCredits])

  return {
    // State
    credits,
    transactions,
    loading,
    error,
    
    // Actions
    purchaseCredits,
    spendCredits,
    addCredits,
    loadCredits,
    loadTransactions,
    
    // Utilities
    canAfford,
    getSpendingStats,
    getMonthlyAllocation,
    
    // Computed values
    currentBalance: credits?.current_balance || 0,
    lifetimeEarned: credits?.lifetime_earned || 0,
    lifetimeSpent: credits?.lifetime_spent || 0,
  }
}

// Specialized hook for credit purchase flow
export function useCreditPurchase() {
  const { purchaseCredits, loading } = useCredits()
  const [purchaseLoading, setPurchaseLoading] = useState(false)

  const handlePurchase = useCallback(async (packageId: string, paymentMethod: string) => {
    setPurchaseLoading(true)
    try {
      const result = await purchaseCredits(packageId, paymentMethod)
      return result
    } finally {
      setPurchaseLoading(false)
    }
  }, [purchaseCredits])

  return {
    purchaseCredits: handlePurchase,
    loading: loading || purchaseLoading,
  }
}