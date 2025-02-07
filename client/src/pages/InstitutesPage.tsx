import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookmarkPlus, BookmarkCheck, MapPin, Building2, TrendingUp, TrendingDown, Users } from 'lucide-react'
import { clsx } from 'clsx'

const mockInstitutes = [
  {
    id: 1,
    name: 'University of Toronto',
    type: 'University',
    location: 'Toronto, ON',
    totalGrants: 245,
    activeRecipients: 89,
    totalValue: '$28.5M',
    latestGrant: '2024-02-01',
    trending: 'up'
  },
  {
    id: 2,
    name: 'McGill University',
    type: 'University',
    location: 'Montreal, QC',
    totalGrants: 198,
    activeRecipients: 72,
    totalValue: '$22.3M',
    latestGrant: '2024-01-28',
    trending: 'up'
  },
  {
    id: 3,
    name: 'University of British Columbia',
    type: 'University',
    location: 'Vancouver, BC',
    totalGrants: 212,
    activeRecipients: 81,
    totalValue: '$25.7M',
    latestGrant: '2024-01-25',
    trending: 'down'
  }
]

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
        {mockInstitutes.map(institute => (
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
                    <Building2 className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>{institute.type}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>{institute.location}</span>
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
              <div className="pt-4 border-t space-y-2">
                <div className="grid grid-cols-3 text-sm">
                  <div className="text-gray-600">Active Grants</div>
                  <div className="text-gray-600">Recipients</div>
                  <div className="text-gray-600">Total Value</div>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <div className="font-medium flex items-center">
                    {institute.totalGrants}
                    {institute.trending === 'up' ? (
                      <TrendingUp className="h-4 w-4 ml-1 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 ml-1 text-red-500" />
                    )}
                  </div>
                  <div className="font-medium flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {institute.activeRecipients}
                  </div>
                  <div className="font-medium">{institute.totalValue}</div>
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