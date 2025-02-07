import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { 
  BookmarkPlus, 
  BookmarkCheck, 
  MapPin, 
  University, 
  FileText,
  DollarSign,
  BarChart2,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { clsx } from 'clsx'

const mockRecipientDetails = {
  id: 1,
  name: 'Dr. Jane Smith',
  institute: 'University of Toronto',
  type: 'Academia',
  location: 'Toronto, ON',
  stats: {
    total_grants: { value: 12, trend: 'up' },
    total_value: { value: '$1,250,000', trend: 'up' },
    avg_grant_size: { value: '$104,166', trend: 'down' }
  },
  funding_history: [
    { year: 2019, value: 170000 },
    { year: 2020, value: 200000 },
    { year: 2021, value: 275000 },
    { year: 2022, value: 325000 },
    { year: 2023, value: 300000 }
  ],
  grants: [
    {
      id: 1,
      ref_number: 'NSERC-2024-0123',
      title: 'Advanced Machine Learning for Computer Vision',
      agency: 'NSERC',
      value: '$325,000',
      start_date: '2024-01-01',
      end_date: '2026-12-31'
    },
    {
      id: 2,
      ref_number: 'NSERC-2023-0456',
      title: 'Deep Learning Applications in Healthcare',
      agency: 'NSERC',
      value: '$250,000',
      start_date: '2023-05-01',
      end_date: '2025-04-30'
    },
    {
      id: 3,
      ref_number: 'CIHR-2022-0789',
      title: 'AI-Driven Medical Image Analysis',
      agency: 'CIHR',
      value: '$175,000',
      start_date: '2022-09-01',
      end_date: '2024-08-31'
    }
  ]
}

export const RecipientProfilePage = () => {
  const { id } = useParams()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [sortConfig, setSortConfig] = useState<{
    field: 'date' | 'value'
    direction: 'asc' | 'desc'
  }>({
    field: 'date',
    direction: 'desc'
  })

  // Sort grants based on current sort configuration
  const sortedGrants = [...mockRecipientDetails.grants].sort((a, b) => {
    if (sortConfig.field === 'date') {
      const aDate = new Date(a.start_date).getTime()
      const bDate = new Date(b.start_date).getTime()
      return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate
    } else {
      const aValue = parseInt(a.value.replace(/[^0-9]/g, ''))
      const bValue = parseInt(b.value.replace(/[^0-9]/g, ''))
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
    }
  })

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Profile and Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Profile Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 lg:col-span-1">
          <div className="flex justify-between">
            <div className="space-y-3">
              <h1 className="text-2xl font-semibold">{mockRecipientDetails.name}</h1>
              <div className="flex items-center text-gray-600">
                <University className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{mockRecipientDetails.institute}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{mockRecipientDetails.location}</span>
              </div>
            </div>
            <button 
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={clsx(
                "p-2 h-fit rounded-full transition-colors hover:bg-gray-50",
                isBookmarked
                  ? "text-blue-600 hover:text-blue-700"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              {isBookmarked 
                ? <BookmarkCheck className="h-5 w-5" />
                : <BookmarkPlus className="h-5 w-5" />
              }
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 lg:col-span-1">
          <div className="flex items-center text-gray-600 mb-2">
            <FileText className="h-4 w-4 mr-2" />
            Total Grants
          </div>
          <div className="flex items-center">
            <span className="text-2xl font-semibold text-right">
              {mockRecipientDetails.stats.total_grants.value}
            </span>
            {mockRecipientDetails.stats.total_grants.trend === 'up' ? (
              <TrendingUp className="h-5 w-5 ml-2 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 ml-2 text-red-500" />
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 lg:col-span-1">
          <div className="flex items-center text-gray-600 mb-2">
            <DollarSign className="h-4 w-4 mr-2" />
            Total Funding
          </div>
          <div className="flex items-center">
            <span className="text-2xl font-semibold text-right">
              {mockRecipientDetails.stats.total_value.value}
            </span>
            {mockRecipientDetails.stats.total_value.trend === 'up' ? (
              <TrendingUp className="h-5 w-5 ml-2 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 ml-2 text-red-500" />
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 lg:col-span-1">
          <div className="flex items-center text-gray-600 mb-2">
            <BarChart2 className="h-4 w-4 mr-2" />
            Average Grant
          </div>
          <div className="flex items-center">
            <span className="text-2xl font-semibold text-right">
              {mockRecipientDetails.stats.avg_grant_size.value}
            </span>
            {mockRecipientDetails.stats.avg_grant_size.trend === 'up' ? (
              <TrendingUp className="h-5 w-5 ml-2 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 ml-2 text-red-500" />
            )}
          </div>
        </div>
      </div>

      {/* Funding History Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Funding History</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={mockRecipientDetails.funding_history}
              margin={{ top: 10, right: 30, left: 50, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="year" 
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tickFormatter={(value) => `${value/1000}k`}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                tick={{ fontSize: 12 }}
                tickMargin={8}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toLocaleString()}`, 'Funding']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '8px 12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={{ fill: '#2563eb', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grants List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Research Grants</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Sort by</span>
            <div className="flex rounded-lg border border-gray-200 divide-x">
              <button
                onClick={() => setSortConfig({ 
                  field: 'date', 
                  direction: sortConfig.field === 'date' ? (sortConfig.direction === 'asc' ? 'desc' : 'asc') : 'desc'
                })}
                className={clsx(
                  'px-3 py-1.5 text-sm transition-colors',
                  sortConfig.field === 'date' 
                    ? 'bg-gray-50 text-gray-900 font-medium' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                Date {sortConfig.field === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => setSortConfig({ 
                  field: 'value', 
                  direction: sortConfig.field === 'value' ? (sortConfig.direction === 'asc' ? 'desc' : 'asc') : 'desc'
                })}
                className={clsx(
                  'px-3 py-1.5 text-sm transition-colors',
                  sortConfig.field === 'value' 
                    ? 'bg-gray-50 text-gray-900 font-medium' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                Value {sortConfig.field === 'value' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>
        </div>
        <div className="divide-y">
          {sortedGrants.map(grant => (
            <div key={grant.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="text-lg font-medium">{grant.title}</div>
                  <div className="text-sm text-gray-500">
                    {grant.ref_number} • {grant.agency}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(grant.start_date).toLocaleDateString()} - {new Date(grant.end_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="font-medium text-right">
                  {grant.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RecipientProfilePage