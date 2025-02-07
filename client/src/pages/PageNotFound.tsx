import { Link } from 'react-router-dom'
import { AlertCircle, Home, Search } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-4 max-w-lg">
        {/* Icon */}
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-gray-400" />
        </div>
        
        {/* Text Content */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 pb-2">Page Not Found</h1>
          <p className="text-m text-gray-600">
            We couldn't find the page you're looking for. The page might have been removed or had its name changed.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-m font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <Link
            to="/search"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-m font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Search className="h-4 w-4 mr-2" />
            Try Searching
          </Link>
        </div>
      </div>
    </div>
  )
}