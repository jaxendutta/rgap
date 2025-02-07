import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookmarkPlus, BookmarkCheck, MapPin, University, Users, FileText } from 'lucide-react'
import { clsx } from 'clsx'
import { formatCurrency } from '../utils/NumberDisplayFormat'

// Data
// Make a copy of the mock data for now
import { mockInstitutes } from '../test-data/mockdata'
const institutes = [...mockInstitutes]

export const InstitutesPage = () => {
  const [bookmarked, setBookmarked] = useState<number[]>([])

  const toggleBookmark = (id: number) => {
    setBookmarked(prev => 
      prev.includes(id) 
        ? prev.filter(b => b !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Research Institutes</h1>
          <p className="text-gray-600 mt-1">Browse research institutes and their funding profiles.</p>
        </div>
      </div>

      {/* Grid of Institutes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {institutes.map(institute => (
          <div 
            key={institute.id} 
            className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm"
          >
            {/* Card Header */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <Link 
                    to={`/institutes/${institute.id}`}
                    className="text-lg font-medium hover:text-blue-600 transition-colors"
                  >
                    {institute.name}
                  </Link>
                  <div className="flex items-center text-gray-600">
                    <University className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>{institute.type}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>{institute.city}, {institute.province}</span>
                  </div>
                </div>
                <button 
                  onClick={() => toggleBookmark(institute.id)}
                  className={clsx(
                    "p-2 rounded-full transition-colors hover:bg-gray-50",
                    bookmarked.includes(institute.id)
                      ? "text-blue-600 hover:text-blue-700"
                      : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  {bookmarked.includes(institute.id) 
                    ? <BookmarkCheck className="h-5 w-5" />
                    : <BookmarkPlus className="h-5 w-5" />
                  }
                </button>
              </div>

              {/* Stats Grid */}
              <div className="pt-4 border-t">
                <div className="grid grid-cols-3 text-sm">
                  <div className="text-gray-600">Active Grants</div>
                  <div className="text-gray-600">Recipients</div>
                  <div className="text-gray-600">Total Value</div>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <div className="font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    {institute.grants.length}
                  </div>
                  <div className="font-medium flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {institute.recipients.length}
                  </div>
                  <div className="font-medium">
                  {formatCurrency(institute.funding_history.reduce((acc, { value }) => acc + value, 0))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default InstitutesPage