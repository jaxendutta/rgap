import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookmarkPlus, BookmarkCheck, MapPin, University, TrendingUp, TrendingDown } from 'lucide-react'
import { clsx } from 'clsx'

const mockRecipients = [
  {
    id: 1,
    name: 'Dr. Jane Smith',
    institute: 'University of Toronto',
    type: 'Academia',
    location: 'Toronto, ON',
    totalGrants: 12,
    totalValue: '$1,250,000',
    latestGrant: '2024-01-14',
    trending: 'up'
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    institute: 'McGill University',
    type: 'Academia',
    location: 'Montreal, QC',
    totalGrants: 8,
    totalValue: '$950,000',
    latestGrant: '2024-01-31',
    trending: 'down'
  },
  {
    id: 3,
    name: 'Dr. Sarah Johnson',
    institute: 'University of British Columbia',
    type: 'Academia',
    location: 'Vancouver, BC',
    totalGrants: 15,
    totalValue: '$2,100,000',
    latestGrant: '2024-01-29',
    trending: 'up'
  }
]

export const RecipientsPage = () => {
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
          <h1 className="text-2xl font-semibold">Research Grant Recipients</h1>
          <p className="text-gray-600 mt-1">Browse research grant recipients here.</p>
        </div>
      </div>

      {/* Grid of Recipients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockRecipients.map(recipient => (
          <div 
            key={recipient.id} 
            className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm"
          >
            {/* Card Header */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <Link 
                    to={`/recipients/${recipient.id}`}
                    className="text-lg font-medium hover:text-blue-600 transition-colors"
                  >
                    {recipient.name}
                  </Link>
                  <div className="flex items-center text-gray-600">
                    <University className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>{recipient.institute}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>{recipient.location}</span>
                  </div>
                </div>
                <button 
                  onClick={() => toggleBookmark(recipient.id)}
                  className={clsx(
                    "p-2 rounded-full transition-colors hover:bg-gray-50",
                    bookmarked.includes(recipient.id)
                      ? "text-blue-600 hover:text-blue-700"
                      : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  {bookmarked.includes(recipient.id) 
                    ? <BookmarkCheck className="h-5 w-5" />
                    : <BookmarkPlus className="h-5 w-5" />
                  }
                </button>
              </div>

              {/* Stats Table */}
              <div className="pt-4 border-t space-y-2">
                <div className="grid grid-cols-3 text-sm">
                  <div className="text-gray-600">Total Grants</div>
                  <div className="text-gray-600">Total Value</div>
                  <div className="text-gray-600">Latest</div>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <div className="font-medium flex items-center">
                    {recipient.totalGrants}
                    {recipient.trending === 'up' ? (
                      <TrendingUp className="h-4 w-4 ml-1 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 ml-1 text-red-500" />
                    )}
                  </div>
                  <div className="font-medium">{recipient.totalValue}</div>
                  <div className="font-medium text-gray-900">
                    {new Date(recipient.latestGrant).toLocaleDateString()}
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

export default RecipientsPage