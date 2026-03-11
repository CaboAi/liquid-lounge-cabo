import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  const profile = profileData as { full_name: string | null } | null

  const params = await searchParams
  const paymentStatus = params.payment ?? null

  return (
    <DashboardClient
      userId={user.id}
      userName={profile?.full_name ?? null}
      initialPaymentStatus={paymentStatus}
    />
  )
}
