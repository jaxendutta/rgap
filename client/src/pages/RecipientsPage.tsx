import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookmarkPlus, BookmarkCheck, MapPin, University, FileText, Calendar } from 'lucide-react'
import { clsx } from 'clsx'
import { formatCurrency, formatDate } from '../utils/NumberDisplayFormat'
import { Recipient, ResearchGrant } from '../types/models'

// Data
// Make a copy of the mock data for now
import { mock_data } from '../test-data/mockdata'
const recipients: Recipient[] = [...mock_data.Recipient]
const grants: ResearchGrant[] = [...mock_data.ResearchGrant]

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
        {recipients.map((recipient: Recipient) => (
          <div
            key={recipient.recipient_id}
            className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm"
          >
            {/* Card Header */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <Link
                    to={`/recipients/${recipient.recipient_id}`}
                    className="text-lg font-medium hover:text-blue-600 transition-colors"
                  >
                    {recipient.legal_name}
                  </Link>
                    <div className="flex items-center text-gray-600">
                    {/* TODO: Link to the recipient's research organization */}
                    <Link
                      to={`/institutes/1`}
                      className="flex items-center hover:text-blue-600 transition-colors"
                    >
                      <University className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span>{recipient.research_organization_name}</span>
                    </Link>
                    </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>{recipient.city}, {recipient.province}</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleBookmark(recipient.recipient_id)}
                  className={clsx(
                    "p-2 rounded-full transition-colors hover:bg-gray-50",
                    bookmarked.includes(recipient.recipient_id)
                      ? "text-blue-600 hover:text-blue-700"
                      : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  {bookmarked.includes(recipient.recipient_id)
                    ? <BookmarkCheck className="h-5 w-5" />
                    : <BookmarkPlus className="h-5 w-5" />
                  }
                </button>
              </div>

              {/* Stats Table */}
              <div className="pt-4 border-t">
                <div className="grid grid-cols-3 text-sm">
                  <div className="text-gray-600">Grants</div>
                  <div className="text-gray-600">Total Funding</div>
                  <div className="text-gray-600">Latest Grant</div>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <div className="font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    {grants.filter(grant => grant.recipient_id === recipient.recipient_id).length}
                  </div>
                  <div className="font-medium">
                    {formatCurrency(grants.filter(grant => grant.recipient_id === recipient.recipient_id).reduce((acc, grant) => acc + grant.agreement_value, 0))}
                  </div>
                  <div className="font-medium text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {(() => {
                      const recipientGrants = grants
                        .filter(grant => grant.recipient_id === recipient.recipient_id)
                        .sort((a, b) => new Date(b.agreement_start_date).getTime() - new Date(a.agreement_start_date).getTime());
                      return recipientGrants.length > 0
                        ? formatDate(new Date(recipientGrants[0].agreement_start_date).toLocaleDateString())
                        : 'N/A';
                    })()}
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