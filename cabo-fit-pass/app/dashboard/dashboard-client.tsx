'use client'

import { useState } from 'react'
import { useCredits } from '@/hooks/use-credits'
import { useBookings } from '@/hooks/use-bookings'
import { useTransactions } from '@/hooks/use-transactions'
import { BookingCard } from '@/components/booking-card'
import type { Database } from '@/lib/supabase/types'

type BookingWithClass = Database['public']['Tables']['bookings']['Row'] & {
  class: { title: string; scheduled_at: string } | null
}
import { CreditPurchaseModal } from '@/components/CreditPurchasemodal'
import { Button } from '@/components/ui/button'

type DashboardClientProps = {
  userId: string
  userName: string | null
  initialPaymentStatus: string | null
}

export function DashboardClient({ userId, userName, initialPaymentStatus }: DashboardClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const credits = useCredits(userId)
  const bookings = useBookings(userId)
  const transactions = useTransactions(userId)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {initialPaymentStatus === 'success' && (
          <div
            data-testid="payment-success-banner"
            className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-xl px-6 py-4 text-sm font-medium"
          >
            Payment successful! Your credits have been added.
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back{userName ? `, ${userName}` : ''}!
          </h1>
          <p className="text-gray-500 text-sm mt-1">Your fitness dashboard</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500 mb-1">Credits available</p>
            {credits.isPending ? (
              <div className="h-10 w-16 bg-gray-100 rounded animate-pulse" />
            ) : (
              <p
                data-testid="credit-balance"
                className="text-3xl font-bold text-orange-500 font-mono"
              >
                {credits.data ?? 0}
              </p>
            )}
            <Button
              size="sm"
              variant="outline"
              className="mt-3 w-full"
              onClick={() => setIsModalOpen(true)}
            >
              Buy Credits
            </Button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500 mb-1">Classes this month</p>
            <p className="text-3xl font-bold text-gray-900 font-mono">
              {(bookings.data as BookingWithClass[] | undefined)?.filter((b) => b.status === 'confirmed').length ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500 mb-1">Studios visited</p>
            <p className="text-3xl font-bold text-gray-900 font-mono">0</p>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your bookings</h2>
          {bookings.isError && (
            <p className="text-sm text-destructive">Failed to load bookings.</p>
          )}
          {bookings.isPending && (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-white rounded-xl animate-pulse border border-gray-100" />
              ))}
            </div>
          )}
          {bookings.isSuccess && (bookings.data as BookingWithClass[]).length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <p className="text-gray-400 text-sm">No upcoming bookings</p>
              <a
                href="/classes"
                className="mt-4 inline-block bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
              >
                Browse classes
              </a>
            </div>
          )}
          {bookings.isSuccess && (bookings.data as BookingWithClass[]).length > 0 && (
            <div data-testid="bookings-list" className="space-y-3">
              {(bookings.data as BookingWithClass[]).map((booking) => (
                <BookingCard key={booking.id} booking={booking} userId={userId} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Credit history</h2>
          {transactions.isError && (
            <p className="text-sm text-destructive">Failed to load transactions.</p>
          )}
          {transactions.isPending && (
            <div className="h-32 bg-white rounded-xl animate-pulse border border-gray-100" />
          )}
          {transactions.isSuccess && transactions.data.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <p className="text-gray-400 text-sm">No transactions yet</p>
            </div>
          )}
          {transactions.isSuccess && transactions.data.length > 0 && (
            <div
              data-testid="transactions-list"
              className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50"
            >
              {transactions.data.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <span className="text-gray-500 mr-3">
                      {new Date(tx.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-gray-700 capitalize">{tx.type}</span>
                    {tx.note && (
                      <span className="text-gray-400 ml-2 text-xs">{tx.note}</span>
                    )}
                  </div>
                  <span
                    className={
                      tx.amount >= 0 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'
                    }
                  >
                    {tx.amount >= 0 ? `+${tx.amount}` : tx.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <CreditPurchaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </main>
  )
}
