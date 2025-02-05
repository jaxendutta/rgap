import { useState } from 'react'
import { Database, Users, Search } from 'lucide-react'
import { clsx } from 'clsx'

const tabs = [
  { name: 'Grants', icon: Database },
  { name: 'Recipients', icon: Users },
  { name: 'Saved Searches', icon: Search },
]

export const FavoritesPage = () => {
  const [activeTab, setActiveTab] = useState('Grants')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Favorites</h1>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => setActiveTab(name)}
              className={clsx(
                'flex items-center py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === name
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <Icon className="h-5 w-5 mr-2" />
              {name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'Grants' && (
          <div className="text-gray-500">No favorite grants yet.</div>
        )}
        {activeTab === 'Recipients' && (
          <div className="text-gray-500">No favorite recipients yet.</div>
        )}
        {activeTab === 'Saved Searches' && (
          <div className="text-gray-500">No saved searches yet.</div>
        )}
      </div>
    </div>
  )
}