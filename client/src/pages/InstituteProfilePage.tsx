import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  BookmarkPlus, 
  BookmarkCheck, 
  MapPin, 
  Building2, 
  FileText,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  GraduationCap
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { clsx } from 'clsx'

const mockInstituteDetails = {
  id: 1,
  name: 'University of Toronto',
  type: 'University',
  location: 'Toronto, ON',
  stats: {
    total_grants: { value: 245, trend: 'up' },
    total_value: { value: '$28.5M', trend: 'up' },
    recipients: { value: 89, trend: 'up' }
  },
  funding_history: [
    { year: 2019, value: 18500000 },
    { year: 2020, value: 21000000 },
    { year: 2021, value: 24500000 },
    { year: 2022, value: 26800000 },
    { year: 2023, value: 28500000 }
  ],
  top_recipients: [
    {
      id: 1,
      name: 'Dr. Jane Smith',
      department: 'Computer Science',
      grants: 12,
      total_funding: '$1,250,000'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      department: 'Biomedical Engineering',
      grants: 8,
      total_funding: '$950,000'
    },
    {
      id: 3,
      name: 'Dr. Sarah Johnson',
      department: 'Physics',
      grants: 15,
      total_funding: '$2,100,000'
    }
  ],
  recent_grants: [
    {
      id: 1,
      ref_number: 'NSERC-2024-0123',
      title: 'Advanced Machine Learning Research Center',
      recipient: 'Dr. Jane Smith',
      agency: 'NSERC',
      value: '$2,500,000',
      start_date: '2024-01-01',
      end_date: '2026-12-31'
    },
    {
      id: 2,
      ref_number: 'CIHR-2023-0456',
      title: 'Medical Imaging Innovation Lab',
      recipient: 'Dr. Michael Chen',
      agency: 'CIHR',
      value: '$1,800,000',
      start_date: '2023-09-01',
      end_date: '2025-08-31'
    },
    {
      id: 3,
      ref_number: 'SSHRC-2023-0789',
      title: 'Digital Humanities Research Initiative',
      recipient: 'Dr. Sarah Johnson',
      agency: 'SSHRC',
      value: '$750,000',
      start_date: '2023-05-01',
      end_date: '2024-04-30'
    }
  ]
}

export const InstituteProfilePage = () => {
  const { id } = useParams()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [recipientBookmarks, setRecipientBookmarks] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState<'grants' | 'recipients'>('grants')

  const toggleRecipientBookmark = (id: number) => {
    setRecipientBookmarks(prev => 
      prev.includes(id)
        ? prev.filter(b => b !== id)
        : [...prev, id]
    )
  }
  const [sortConfig, setSortConfig] = useState<{
    field: 'date' | 'value'
    direction: 'asc' | 'desc'
  }>({
    field: 'date',
    direction: 'desc'
  })

  // Sort grants based on current sort configuration
  const sortedGrants = [...mockInstituteDetails.recent_grants].sort((a, b) => {
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
              <h1 className="text-2xl font-semibold">{mockInstituteDetails.name}</h1>
              <div className="flex items-center text-gray-600">
                <Building2 className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{mockInstituteDetails.type}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{mockInstituteDetails.location}</span>
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
            Grants
          </div>
          <div className="flex items-center">
            <span className="text-2xl font-semibold">
              {mockInstituteDetails.stats.total_grants.value}
            </span>
            {mockInstituteDetails.stats.total_grants.trend === 'up' ? (
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
            <span className="text-2xl font-semibold">
              {mockInstituteDetails.stats.total_value.value}
            </span>
            {mockInstituteDetails.stats.total_value.trend === 'up' ? (
              <TrendingUp className="h-5 w-5 ml-2 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 ml-2 text-red-500" />
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 lg:col-span-1">
          <div className="flex items-center text-gray-600 mb-2">
            <Users className="h-4 w-4 mr-2" />
            Recipients
          </div>
          <div className="flex items-center">
            <span className="text-2xl font-semibold">
              {mockInstituteDetails.stats.recipients.value}
            </span>
            {mockInstituteDetails.stats.recipients.trend === 'up' ? (
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
              data={mockInstituteDetails.funding_history}
              margin={{ top: 10, right: 30, left: 50, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="year" 
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tickFormatter={(value) => `${value/1000000}M`}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                tick={{ fontSize: 12 }}
                tickMargin={8}
              />
              <Tooltip 
                formatter={(value: number) => [`$${(value/1000000).toFixed(1)}M`, 'Funding']}
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

      {/* Tabs for Grants and Recipients */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between px-6">
            <div className="flex">
              <button
                onClick={() => setActiveTab('grants')}
                className={clsx(
                  'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'grants'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                Grants
              </button>
              <button
                onClick={() => setActiveTab('recipients')}
                className={clsx(
                  'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'recipients'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                Recipients
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortConfig(prev => ({
                  ...prev,
                  direction: prev.direction === 'asc' ? 'desc' : 'asc'
                }))}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-50"
              >
                <span>{sortConfig.field === 'date' ? 'Date' : 'Value'}</span>
                <span className="text-gray-900">
                  {sortConfig.direction === 'asc' ? '↑' : '↓'}
                </span>
              </button>
              <button
                onClick={() => setSortConfig(prev => ({
                  ...prev,
                  field: prev.field === 'date' ? 'value' : 'date'
                }))}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-50"
              >
                <span>Toggle Field</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="divide-y">
          {activeTab === 'grants' ? (
            // Grants List
            sortedGrants.map(grant => (
              <div key={grant.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="text-lg font-medium">{grant.title}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <GraduationCap className="h-4 w-4 mr-1" />
                      {grant.recipient}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      {grant.ref_number} • {grant.agency}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-medium">{grant.value}</div>
                    <div className="text-sm text-gray-500">
                      <div>{new Date(grant.start_date).toLocaleDateString()}</div>
                      <div>{new Date(grant.end_date).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Recipients List with header
            <div>

              {mockInstituteDetails.top_recipients.map(recipient => (
                <div key={recipient.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <Link 
                        to={`/recipients/${recipient.id}`}
                        className="text-lg font-medium hover:text-blue-600 transition-colors flex items-center"
                      >
                        {recipient.name}
                      </Link>
                        <div className="text-sm text-gray-500 flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {recipient.grants} grants
                        </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="font-medium text-right">
                        {recipient.total_funding}
                      </div>
                      <button
                        onClick={() => toggleRecipientBookmark(recipient.id)}
                        className={clsx(
                          "p-1 rounded-full transition-colors hover:bg-gray-100",
                          recipientBookmarks.includes(recipient.id)
                            ? "text-blue-600 hover:text-blue-700"
                            : "text-gray-400 hover:text-gray-600"
                        )}
                      >
                        {recipientBookmarks.includes(recipient.id)
                          ? <BookmarkCheck className="h-5 w-5" />
                          : <BookmarkPlus className="h-5 w-5" />
                        }
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InstituteProfilePage