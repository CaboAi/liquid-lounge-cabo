'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function SupabaseTest() {
  const [status, setStatus] = useState('Testing...')

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = createClient()
        // Simple connection test
        const { error } = await supabase.auth.getSession()
        setStatus(error ? ' Connection Error' : ' Supabase Connected')
      } catch {
        setStatus(' Connection Failed')
      }
    }
    testConnection()
  }, [])

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <p className="text-blue-800">{status}</p>
    </div>
  )
}
