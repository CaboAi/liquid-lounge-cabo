import Link from 'next/link'
import { ArrowRightIcon } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-6">
              CaboFit Pass
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Your all-access pass to Los Cabos' premier fitness studios. 
              Book classes, track your progress, and stay fit in paradise.
            </p>
            <div className="space-x-4">
              <Link
                href="/auth/signin"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Sign In
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition-colors"
              >
                Get Started
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Easy Booking</h3>
              <p className="text-blue-100">
                Book fitness classes instantly across multiple studios with our streamlined booking system.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Track Progress</h3>
              <p className="text-blue-100">
                Monitor your fitness journey with detailed analytics and progress tracking.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Local Network</h3>
              <p className="text-blue-100">
                Access Los Cabos' best fitness studios and connect with the local fitness community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}