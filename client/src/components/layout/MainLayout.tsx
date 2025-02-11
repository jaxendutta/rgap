import { ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

interface MainLayoutProps {
  children: ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-2 pb-20 lg:p-6 lg:pb-6"> {/* Added pb-20 for mobile */}
          {children}
        </main>
      </div>
    </div>
  )
}

export default MainLayout