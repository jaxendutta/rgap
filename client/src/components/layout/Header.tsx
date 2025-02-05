import { Link } from 'react-router-dom'
import { Search, Bell, User, Filter, SortDesc, BookmarkPlus } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

const Header = () => {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <header className="bg-white border-b">
      <div className="px-4 flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-semibold">RGAP</span>
            <span className="ml-2 text-sm text-gray-600">[ Research Grant Analytics Platform ]</span>
          </Link>
        </div>

        {/* Search with Actions */}
        <div className="flex-1 max-w-3xl mx-8">
          <div className="relative flex items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="search"
                placeholder="Search grants, recipients, or programs..."
                className="w-full pl-10 pr-32 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-300"
              />
            </div>
            
            {/* Search Action Buttons */}
            <div className="absolute right-2 flex items-center space-x-1">
              <button 
                className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-700"
                title="Save Search"
              >
                <BookmarkPlus className="h-5 w-5" />
              </button>
              <button 
                className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-700"
                title="Sort"
              >
                <SortDesc className="h-5 w-5" />
              </button>
              <button 
                className={clsx(
                  "p-1.5 rounded-md text-gray-500 hover:text-gray-700",
                  showFilters ? "bg-gray-100" : "hover:bg-gray-100"
                )}
                onClick={() => setShowFilters(!showFilters)}
                title="Filter"
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Filter Panel - This will be expanded later */}
          {showFilters && (
            <div className="absolute mt-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-3xl z-10">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <select className="mt-1 block w-full rounded-md border border-gray-300 p-2">
                    <option>All Years</option>
                    <option>2024</option>
                    <option>2023</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Agency</label>
                  <select className="mt-1 block w-full rounded-md border border-gray-300 p-2">
                    <option>All Agencies</option>
                    <option>NSERC</option>
                    <option>SSHRC</option>
                    <option>CIHR</option>
                  </select>
                </div>
                {/* More filters will be added here */}
              </div>
            </div>
          )}
        </div>

        {/* Right Icons */}
        <div className="flex items-center space-x-4">
          <button className="p-1 text-gray-600 hover:text-gray-800">
            <Bell className="h-6 w-6" />
          </button>
          <button className="p-1 text-gray-600 hover:text-gray-800">
            <User className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header