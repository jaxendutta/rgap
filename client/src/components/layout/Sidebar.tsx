import { Link, useLocation } from 'react-router-dom'
import { Home, Search, University, GraduationCap, Bookmark } from 'lucide-react'
import { clsx } from 'clsx'
import { useState } from 'react'

const navigation = [
  { name: 'Home', icon: Home, href: '/' },
  { name: 'Search', icon: Search, href: '/search' },
  { name: 'Institutes', icon: University, href: '/institutes' },
  { name: 'Recipients', icon: GraduationCap, href: '/recipients' },
  { name: 'Bookmarks', icon: Bookmark, href: '/bookmarks' },
]

const Sidebar = () => {
  const location = useLocation()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div 
      className={clsx(
        "bg-gray-50 border-r min-h-screen transition-all duration-300 ease-in-out",
        isExpanded ? "w-48" : "w-16"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <nav className="p-2 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={clsx(
                'flex items-center relative h-12 rounded-lg',
                isActive 
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              )}
            >
              {/* Icon container - fixed position */}
              <div className="w-12 flex items-center justify-center absolute left-0 top-0 h-full">
                <Icon className="h-5 w-5" />
              </div>
              
              {/* Text container - appears on expand */}
              <div className={clsx(
                "transition-opacity duration-300 pl-12 py-3 whitespace-nowrap",
                isExpanded ? "opacity-100 visible" : "opacity-0 invisible"
              )}>
                {item.name}
              </div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default Sidebar