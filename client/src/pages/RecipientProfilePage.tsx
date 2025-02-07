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
  TrendingDown,
  Calendar
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { clsx } from 'clsx'
import { formatCurrency, formatDate } from '../utils/NumberDisplayFormat'
import { Recipient, ResearchGrant } from '../components/types/types'

// Data
// Make a copy of the mock data for now
import { mock_data } from '../test-data/mockdata'
const recipients: Recipient[] = [...mock_data.Recipient]
const grants: ResearchGrant[] = [...mock_data.ResearchGrant]
const filteredGrants = (recipient_id: number) => grants.filter(g => g.recipient_id === recipient_id)

// Types
type SortField = 'date' | 'value'
type SortDirection = 'asc' | 'desc'

interface SortConfig {
  field: SortField
  direction: SortDirection
}

// Sort functions
const sortByDate = (a: ResearchGrant, b: ResearchGrant, direction: SortDirection): number => {
  const multiplier = direction === 'asc' ? 1 : -1
  return multiplier * (new Date(a.agreement_start_date).getTime() - new Date(b.agreement_start_date).getTime())
}

const sortByValue = (a: ResearchGrant, b: ResearchGrant, direction: SortDirection): number => {
  const multiplier = direction === 'asc' ? 1 : -1
  return multiplier * (a.agreement_value - b.agreement_value)
}

// Components
const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  trend 
}: { 
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

export const RecipientProfilePage = () => {
  const { id } = useParams()
  const recipient = recipients.find(r => r.recipient_id === Number(id))

  if (!recipient) {
    return <div>Recipient not found</div>
  }

  const [isBookmarked, setIsBookmarked] = useState(false)
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'date',
    direction: 'desc'
  })

  const toggleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  // Sort grants based on current configuration
  const sortedGrants = [...filteredGrants(Number(id))].sort((a, b) =>
    sortConfig.field === 'value'
      ? sortByValue(a, b, sortConfig.direction)
      : sortByDate(a, b, sortConfig.direction)
  )

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Profile and Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Profile Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 lg:col-span-1">
          <div className="flex justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{recipient.legal_name}</h1>
          <div className="flex items-center text-gray-600">
            <University className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{recipient.research_organization_name}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{recipient.city}, {recipient.province}</span>
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
          value={filteredGrants(Number(id)).length}
        />
        <StatCard 
          icon={DollarSign}
          label="Total Funding"
          value={formatCurrency(filteredGrants(Number(id)).reduce((acc, g) => acc + g.agreement_value, 0)) || 'N/A'}
        />
        <StatCard 
          icon={BarChart2}
          label="Average Funding"
          value={filteredGrants(Number(id)).length 
            ? formatCurrency(filteredGrants(Number(id)).reduce((acc, g) => acc + g.agreement_value, 0) / filteredGrants(Number(id)).length)
            : 'N/A'}
        />
      </div>

      {/* Funding History Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Funding History</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredGrants(Number(id)).reduce((acc: { year: number, value: number }[], g) => {
                const year = new Date(g.agreement_start_date).getFullYear()
                const existing = acc.find(item => item.year === year)
                if (existing) {
                  existing.value += g.agreement_value
                } else {
                  acc.push({ year, value: g.agreement_value })
                }
                return acc
              }, [])}
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
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Funding']}
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
          <div className="flex gap-2">
            <SortButton
              label="Date"
              icon={Calendar}
              field="date"
              currentField={sortConfig.field}
              direction={sortConfig.direction}
              onClick={() => toggleSort('date')}
            />
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

        <div className="divide-y">
          {sortedGrants.map(grant => (
            <div key={grant.ref_number} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="text-lg font-medium">{grant.agreement_title_en}</div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <FileText className="h-4 w-4 mr-2 inline-flex-shrink-0" />
                    {grant.ref_number} • {grant.owner_org}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatCurrency(grant.agreement_value)}
                  </div>
                  <div className="text-sm text-gray-500">
                    <div className="flex items-end">
                      <span>{formatDate(grant.agreement_start_date)}</span>
                      <span className="text-gray-400 mx-1">│</span>
                      <span>{formatDate(grant.agreement_end_date)}</span>
                    </div>
                  </div>
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