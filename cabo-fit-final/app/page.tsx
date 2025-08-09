export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent mb-6">
          Cabo Fit Pass
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your fitness marketplace is LIVE! 🏋️‍♂️
        </p>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Successfully Deployed!
          </h2>
          <p className="text-gray-600">
            Complete fitness marketplace coming soon with class booking, studio management, and credit system.
          </p>
        </div>
      </div>
    </div>
  )
}
