// src/components/layout/Header.tsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CircleArrowUp, User } from 'lucide-react'

const Header = () => {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const mainContent = document.getElementById('main-content')
      if (mainContent) {
        // Show button if scrolled down more than 200px
        setShowScrollTop(mainContent.scrollTop > 200)
      }
    }

    const mainContent = document.getElementById('main-content')
    mainContent?.addEventListener('scroll', handleScroll)

    // Initial check
    handleScroll()

    return () => {
      mainContent?.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToTop = () => {
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }

  return (
    <header className="bg-white border-b">
      <div className="px-4 flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center">
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
          <button
            className={`p-1 text-gray-600 hover:text-gray-800 transition-all duration-200 transform ${
              showScrollTop 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-1 pointer-events-none'
            }`}
            onClick={scrollToTop}
            aria-label="Scroll to top"
          >
            <CircleArrowUp className="h-6 w-6" />
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