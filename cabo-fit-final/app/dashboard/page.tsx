'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import ClassCard from '@/components/fitness/ClassCard'

// Sample data - in real app this would come from Supabase
const sampleClasses = [
  {
    id: 1,
    name: 'Sunrise Yoga',
    studio: 'Ocean View Wellness',
    time: '7:00 AM',
    duration: 60,
    credits: 1,
    difficulty: 'Beginner',
    spotsLeft: 8
  },
  {
    id: 2,
    name: 'HIIT Bootcamp',
    studio: 'Cabo Fitness Club',
    time: '6:00 PM',
    duration: 45,
    credits: 2,
    difficulty: 'Advanced',
    spotsLeft: 3
  },
  {
    id: 3,
    name: 'Pilates Core',
    studio: 'Mind Body Studio',
    time: '9:00 AM',
    duration: 50,
    credits: 1,
    difficulty: 'Intermediate',
    spotsLeft: 12
  },
  {
    id: 4,
    name: 'Beach Volleyball',
    studio: 'Los Cabos Sports',
    time: '5:30 PM',
    duration: 90,
    credits: 2,
    difficulty: 'Beginner',
    spotsLeft: 0
  }
]

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
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
          <h2 className="text-2xl font-semibold mb-4">Today&apos;s Classes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sampleClasses.map((classItem) => (
              <ClassCard
                key={classItem.id}
                name={classItem.name}
                studio={classItem.studio}
                time={classItem.time}
                duration={classItem.duration}
                credits={classItem.credits}
                difficulty={classItem.difficulty}
                spotsLeft={classItem.spotsLeft}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
