import { Link } from 'react-router-dom'
import { Search, Database, TrendingUp, UserPlus, LogIn } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="h-full overflow-auto p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <div className="bg-white rounded-lg border hover:border-gray-300 transition-all duration-200">
          <div className="px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl leading-tight flex justify-center items-center">
                <span style={{ fontSize: 'inherit', fontWeight: 'inherit', display: 'inline-block', padding: '0 0.5rem' }}> {/* Adjust padding */}
                  [
                </span>
                <span className="inline-block"> {/* Content span */}
                  Research Grant Analytics Platform
                </span>
                <span style={{ fontSize: 'inherit', fontWeight: 'inherit', display: 'inline-block', padding: '0 0.5rem' }}> {/* Adjust padding */}
                  ]
                </span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Explore and analyze research funding data from Canada's three major research funding agencies: NSERC, CIHR, and SSHRC.
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/search"
                    className="inline-flex items-center justify-center pl-6 pr-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 md:text-lg"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Start Exploring
                  </Link>
                  <Link
                    to="/auth"
                    className="inline-flex items-center justify-center pl-6 pr-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:text-lg"
                  >
                    <LogIn className="h-5 w-5 mr-2" />
                    Your Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-lg border hover:border-gray-300 transition-all duration-200">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gray-900 text-white mb-4">
              <Database className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Comprehensive Data</h3>
            <p className="mt-2 text-base text-gray-500">
              Access and analyze over 170,000 research grants from NSERC, CIHR, and SSHRC.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-lg border hover:border-gray-300 transition-all duration-200">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gray-900 text-white mb-4">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Advanced Analytics</h3>
            <p className="mt-2 text-base text-gray-500">
              Visualize funding trends, analyze success rates, and track research investments.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-lg border hover:border-gray-300 transition-all duration-200">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gray-900 text-white mb-4">
              <UserPlus className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              <Link
                to="/auth"
                className="hover:text-gray-700"
              >
                Create Account
                <span aria-hidden="true" className="ml-1">→</span>
              </Link>
            </h3>
            <p className="mt-2 text-base text-gray-500">
              Sign up to save searches, bookmark grants, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}