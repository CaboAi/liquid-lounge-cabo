interface ClassCardProps {
  name: string
  studio: string
  time: string
  duration: number
  credits: number
  difficulty: string
  spotsLeft: number
  onBook?: () => void
}

export default function ClassCard({
  name,
  studio,
  time,
  duration,
  credits,
  difficulty,
  spotsLeft,
  onBook
}: ClassCardProps) {
  const isFullyBooked = spotsLeft <= 0
  const isAlmostFull = spotsLeft <= 3 && spotsLeft > 0

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-1">{name}</h3>
        <p className="text-orange-600 font-medium">{studio}</p>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Time</span>
          <span className="font-medium">{time}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Duration</span>
          <span className="font-medium">{duration} min</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Level</span>
          <span className="font-medium">{difficulty}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Credits</span>
          <span className="font-bold text-orange-600">{credits}</span>
        </div>
      </div>

      <div className="mb-4">
        {isFullyBooked ? (
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm text-center">
            Fully Booked
          </div>
        ) : isAlmostFull ? (
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm text-center">
            Only {spotsLeft} spots left!
          </div>
        ) : (
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm text-center">
            {spotsLeft} spots available
          </div>
        )}
      </div>

      <button
        onClick={onBook}
        disabled={isFullyBooked}
        className="w-full py-2 px-4 rounded-lg font-medium transition-colors bg-orange-600 text-white hover:bg-orange-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
      >
        {isFullyBooked ? 'Fully Booked' : 'Book Class'}
      </button>
    </div>
  )
}
