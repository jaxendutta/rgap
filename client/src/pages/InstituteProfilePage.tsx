import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  BookmarkPlus, 
  BookmarkCheck, 
  MapPin, 
 University, 
  FileText,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  GraduationCap,
  Calendar
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { clsx } from 'clsx'

// Mock Data
const mockInstituteDetails = {
  id: 1,
  name: 'University of California, Berkeley',
  location: 'Berkeley, CA',
  type: 'Public',
  recent_grants: [
    { id: 1, title: 'Research Grant', ref_number: 'R01GM12345', agency: 'NIH', recipient: 'John Doe', start_date: '2021-01-01', end_date: '2023-12-31', value: 100000 },
    { id: 2, title: 'Scholarship Grant', ref_number: 'P20GM12345', agency: 'NSF', recipient: 'Jane Doe', start_date: '2022-01-01', end_date: '2023-12-31', value: 50000 },
    { id: 3, title: 'Equipment Grant', ref_number: 'U01GM12345', agency: 'CDC', recipient: 'James Doe', start_date: '2023-01-01', end_date: '2023-12-31', value: 250000 }
  ],
  top_recipients: [
    { id: 1, name: 'John Doe', department: 'Biology', grants: 3, total_funding: 500000 },
    { id: 2, name: 'Jane Doe', department: 'Physics', grants: 2, total_funding: 250000 },
    { id: 3, name: 'James Doe', department: 'Chemistry', grants: 1, total_funding: 100000 }
  ],
  stats: {
    total_grants: { value: 10, trend: 'up' as 'up' | 'down' },
    total_value: { value: 1000000, trend: 'down' as 'up' | 'down' },
    recipients: { value: 20, trend: 'up' as 'up' | 'down' }
  },
  funding_history: [
    { year: 2016, value: 500000 },
    { year: 2017, value: 600000 },
    { year: 2018, value: 700000 },
    { year: 2019, value: 800000 },
    { year: 2020, value: 900000 },
    { year: 2021, value: 1000000 }
  ]
}

// Types
type SortField = 'date' | 'value' | 'grants_count'
type SortDirection = 'asc' | 'desc'
type ActiveTab = 'grants' | 'recipients'

interface SortConfig {
  field: SortField
  direction: SortDirection
}

// Utility functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0
  }).format(value)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString()
}

const formatMillions = (value: number): string => {
  return `${(value / 1000000).toFixed(1)}M`
}

// Sort functions
const sortByDate = (a: { start_date: string }, b: { start_date: string }, direction: SortDirection): number => {
  const multiplier = direction === 'asc' ? 1 : -1
  return multiplier * (new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
}

const sortByValue = (a: any, b: any, direction: SortDirection, valueKey: string = 'value'): number => {
  const multiplier = direction === 'asc' ? 1 : -1
  return multiplier * (a[valueKey] - b[valueKey])
}

const sortByGrantsCount = (a: { grants: number }, b: { grants: number }, direction: SortDirection): number => {
  const multiplier = direction === 'asc' ? 1 : -1
  return multiplier * (a.grants - b.grants)
}

// Components
const StatCard = ({ icon: Icon, label, value, trend }: { 
  icon: React.ElementType
  label: string
  value: string | number
  trend?: 'up' | 'down' 
}) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 lg:col-span-1">
    <div className="flex items-center text-gray-600 mb-2">
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </div>
    <div className="flex items-center">
      <span className="text-2xl font-semibold">{value}</span>
      {trend && (
        trend === 'up' 
          ? <TrendingUp className="h-5 w-5 ml-2 text-green-500" />
          : <TrendingDown className="h-5 w-5 ml-2 text-red-500" />
      )}
    </div>
  </div>
)

const SortButton = ({ 
  label, 
  icon: Icon,
  field, 
  currentField, 
  direction, 
  onClick 
}: {
  label: string
  icon?: React.ElementType
  field: SortField
  currentField: SortField
  direction: SortDirection
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={clsx(
      'flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-md hover:bg-gray-50',
      currentField === field ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
    )}
  >
    {Icon && <Icon className="h-4 w-4" />}
    <span>{label}</span>
    {currentField === field && (
      <span className="text-gray-900">
        {direction === 'asc' ? '↑' : '↓'}
      </span>
    )}
  </button>
)

const InstituteProfilePage = () => {
  const { id } = useParams()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [recipientBookmarks, setRecipientBookmarks] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState<ActiveTab>('grants')
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'date',
    direction: 'desc'
  })

  const toggleRecipientBookmark = (id: number) => {
    setRecipientBookmarks(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id])
  }

  const toggleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  // Sort data based on current configuration
  const sortedGrants = [...mockInstituteDetails.recent_grants].sort((a, b) => 
    sortConfig.field === 'value' 
      ? sortByValue(a, b, sortConfig.direction)
      : sortByDate(a, b, sortConfig.direction)
  )

  const sortedRecipients = [...mockInstituteDetails.top_recipients].sort((a, b) => 
    sortConfig.field === 'value'
      ? sortByValue(a, b, sortConfig.direction, 'total_funding')
      : sortByGrantsCount(a, b, sortConfig.direction)
  )

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
                <University className="h-4 w-4 mr-2 flex-shrink-0" />
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
        <StatCard 
          icon={FileText}
          label="Grants"
          value={mockInstituteDetails.stats.total_grants.value}
          trend={mockInstituteDetails.stats.total_grants.trend}
        />
        <StatCard 
          icon={DollarSign}
          label="Total Funding"
          value={formatCurrency(mockInstituteDetails.stats.total_value.value)}
          trend={mockInstituteDetails.stats.total_value.trend}
        />
        <StatCard 
          icon={Users}
          label="Recipients"
          value={mockInstituteDetails.stats.recipients.value}
          trend={mockInstituteDetails.stats.recipients.trend}
        />
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
            
            {/* Sort Controls */}
            <div className="flex gap-2">
              {activeTab === 'grants' && (
                <SortButton
                  label="Date"
                  icon={Calendar}
                  field="date"
                  currentField={sortConfig.field}
                  direction={sortConfig.direction}
                  onClick={() => toggleSort('date')}
                />
              )}
              {activeTab === 'recipients' && (
                <SortButton
                  label="Grants"
                  icon={FileText}
                  field="grants_count"
                  currentField={sortConfig.field}
                  direction={sortConfig.direction}
                  onClick={() => toggleSort('grants_count')}
                />
              )}
              <SortButton
                label="Value"
                icon={DollarSign}
                field="value"
                currentField={sortConfig.field}
                direction={sortConfig.direction}
                onClick={() => toggleSort('value')}
              />
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
                    <div className="text-sm text-gray-500">
                      {grant.ref_number} • {grant.agency}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(grant.value)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(grant.start_date)} - {formatDate(grant.end_date)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Recipients List
            sortedRecipients.map(recipient => (
              <div key={recipient.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <Link 
                      to={`/recipients/${recipient.id}`}
                      className="text-lg font-medium hover:text-blue-600 transition-colors flex items-center"
                    >
                      <GraduationCap className="h-4 w-4 mr-1" />
                      {recipient.name}
                    </Link>
                    <div className="text-sm text-gray-500">
                      {recipient.grants} Grants
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="font-medium text-right">
                      {formatCurrency(recipient.total_funding)}
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
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default InstituteProfilePage