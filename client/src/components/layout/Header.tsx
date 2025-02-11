import { Link } from 'react-router-dom'
import { Bell, User } from 'lucide-react'

const Header = () => {
  return (
    <header className="bg-white border-b">
      <div className="px-4 flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center">
            {/* Logo */}
            <img 
              src="/rgap.svg" 
              alt="RGAP Logo" 
              className="h-5 w-5 mr-2"
            />
            <span className="text-xl font-semibold">RGAP</span>
            <span className="hidden sm:inline ml-2 text-sm text-gray-600">[ Research Grant Analytics Platform ]</span>
          </Link>
        </div>

        {/* Right Icons */}
        <div className="flex items-center space-x-4">
          <button className="p-1 text-gray-600 hover:text-gray-800">
            <Bell className="h-6 w-6" />
          </button>
            <Link to="/account" className="p-1 text-gray-600 hover:text-gray-800">
              <User className="h-6 w-6" />
            </Link>
        </div>
      </div>
    </header>
  )
}

export default Header