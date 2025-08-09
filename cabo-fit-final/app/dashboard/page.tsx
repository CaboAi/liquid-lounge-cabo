'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ClassCard from '@/components/fitness/ClassCard'
import { getAllClasses, Class } from '@/lib/supabase'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    loadClasses()
  }, [session, status, router])

  const loadClasses = async () => {
    try {
      setLoading(true)
      const result = await getAllClasses()
      if (result.success) {
        setClasses(result.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent mb-2">
            Welcome back, {session.user?.email?.split('@')[0]}! 
          </h1>
          <p className="text-gray-600">Find your perfect workout in Los Cabos</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Credits</h2>
          <div className="flex items-center space-x-4">
            <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg">
              <span className="text-2xl font-bold">5</span>
              <span className="text-sm ml-1">credits available</span>
            </div>
            <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">
              Buy More Credits
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            Real Classes from Database ({classes.length})
          </h2>
          
          {classes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <p className="text-gray-600 mb-4">Loading classes from Supabase...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {classes.map((classItem) => (
                <ClassCard
                  key={classItem.id}
                  name={classItem.title}
                  studio="Cabo Fitness"
                  time={new Date(classItem.start_time).toLocaleTimeString()}
                  duration={60}
                  credits={1}
                  difficulty={classItem.difficulty || 'All Levels'}
                  spotsLeft={classItem.capacity}
                  onBook={() => alert('Booking coming in Step 6!')}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
