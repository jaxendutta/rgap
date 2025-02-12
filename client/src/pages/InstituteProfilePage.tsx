import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import {
  BookmarkPlus,
  BookmarkCheck,
  MapPin,
  University,
  BookMarked,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  GraduationCap,
  Calendar
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { clsx } from 'clsx'
import { formatCurrency, formatDate } from '../utils/format'

// Data
// Make a copy of the mock data for now
import { mock_data, mockInstitutes } from '../test-data/mockdata'
import { ResearchGrant } from '../types/models'
const institutes = [...mockInstitutes]
const mock_grants = [...mock_data.ResearchGrant]

// Types
type SortField = 'date' | 'value' | 'grants_count'
type SortDirection = 'asc' | 'desc'
type ActiveTab = 'grants' | 'recipients'

interface SortConfig {
  field: SortField
  direction: SortDirection
}

// Sort functions
const sortByDate = (a: any, b: any, direction: SortDirection, valueKey: string = 'agreement_start_date'): number => {
  const multiplier = direction === 'asc' ? 1 : -1
  return multiplier * (new Date(a[valueKey]).getTime() - new Date(b[valueKey]).getTime())
}

const sortByValue = (a: any, b: any, direction: SortDirection, valueKey: string = 'value'): number => {
  const multiplier = direction === 'asc' ? 1 : -1
  return multiplier * (a[valueKey] - b[valueKey])
}

const sortByGrantsCount = (a: any, b: any, direction: SortDirection): number => {
  const multiplier = direction === 'asc' ? 1 : -1
  return multiplier * (a.grants.legth - b.grants.length)
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
    <span className="hidden lg:flex">{label}</span>
    {currentField === field && (
      <span className="text-gray-900">
        {direction === 'asc' ? '↑' : '↓'}
      </span>
    )}
  </button>
)

const InstituteProfilePage = () => {
  const { id } = useParams()
  const institute = institutes.find(institute => institute.id === Number(id))

  if (!institute) {
    return <Navigate to="/pageNotFound" />
  }

  // TODO: Fetch grants and recipients from the API
  const grants = institute.grants.map(grantId => mock_data.ResearchGrant.find(grant => grant.grant_id === grantId))
  const recipients = institute.recipients.map(recipientId => {
    const recipient = mock_data.Recipient.find(recipient => recipient.recipient_id === recipientId)
    return recipient ? {
      ...recipient,
      grants: grants.filter(grant => grant && grant.recipient_id === recipient.recipient_id)
    } : recipient
  })

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
  const sortedGrants = [...grants].sort((a, b) =>
    sortConfig.field === 'value'
      ? sortByValue(a, b, sortConfig.direction, 'agreement_value')
      : sortByDate(a, b, sortConfig.direction, 'agreement_start_date')
  )

  const sortedRecipients = [...recipients].sort((a, b) =>
    sortConfig.field === 'value'
      ? sortByValue(a, b, sortConfig.direction, 'total_funding')
      : sortByGrantsCount(a, b, sortConfig.direction)
  )

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Profile and Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Profile Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6 lg:col-span-1">
          <div className="flex justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">{institute.name}</h1>
              <div className="flex items-center text-gray-600">
                <University className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{institute.type}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{institute.city}, {institute.province}</span>
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
          icon={BookMarked}
          label="Grants"
          value={institute.stats.total_grants.value}
          trend={institute.stats.total_grants.trend}
        />
        <StatCard
          icon={DollarSign}
          label="Total Funding"
          value={formatCurrency(institute.stats.total_value.value)}
          trend={institute.stats.total_value.trend}
        />
        <StatCard
          icon={Users}
          label="Recipients"
          value={institute.stats.recipients.value}
          trend={institute.stats.recipients.trend}
        />
      </div>

      {/* Funding History Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Funding History</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={institute.funding_history}
              margin={{ top: 10, right: 30, left: 50, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tickFormatter={(value) => `${value / 1000000}M`}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                tick={{ fontSize: 12 }}
                tickMargin={8}
              />
              <Tooltip
                formatter={(value: number) => [`$${(value / 1000000).toFixed(1)}M`, 'Funding']}
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
          <div className="flex items-center justify-between px-4 lg:px-6">
            <div className="flex">
              <button
                onClick={() => setActiveTab('grants')}
                className={clsx(
                  'px-6 py-3 text-md font-medium border-b-2 transition-colors',
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
                  'px-6 py-3 text-md font-medium border-b-2 transition-colors',
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
                  icon={BookMarked}
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
            sortedGrants.map(grant => grant && (
              <div key={grant.grant_id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="text-lg font-medium">{grant.agreement_title_en}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <GraduationCap className="h-4 w-4 mr-1" />
                      {recipients[grant.recipient_id]?.legal_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {grant.ref_number} • {grant.org}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(grant.agreement_value)}
                    </div>
                    <div className="text-sm text-gray-500">
                      <div className="flex items-end">
                        <span>{formatDate(grant.agreement_start_date)}</span>
                        <span className="text-gray-400 mx-1 hidden lg:flex">│</span>
                        <span className="hidden lg:flex">{formatDate(grant.agreement_end_date)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Recipients List
            sortedRecipients.map(recipient => recipient && (
              <div key={recipient.recipient_id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <Link
                      to={`/recipients/${recipient.recipient_id}`}
                      className="text-lg font-medium hover:text-blue-600 transition-colors flex items-center"
                    >
                      <GraduationCap className="h-4 w-4 mr-1" />
                      {recipient.legal_name}
                    </Link>
                    <div className="text-sm text-gray-500">
                      {recipient.grants.length} Grants
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="font-medium text-right">
                      {formatCurrency(recipient.grants.reduce((acc, grant) => grant ? acc + grant.agreement_value : acc, 0))}
                    </div>
                    <button
                      onClick={() => toggleRecipientBookmark(recipient.recipient_id)}
                      className={clsx(
                        "p-1 rounded-full transition-colors hover:bg-gray-100",
                        recipientBookmarks.includes(recipient.recipient_id)
                          ? "text-blue-600 hover:text-blue-700"
                          : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      {recipientBookmarks.includes(recipient.recipient_id)
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