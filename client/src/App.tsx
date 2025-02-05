import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import { HomePage } from './pages/HomePage'
import { SearchPage } from './pages/SearchPage'
import { GrantsPage } from './pages/GrantsPage'
import { RecipientsPage } from './pages/RecipientsPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { FavoritesPage } from './pages/FavoritesPage'

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/grants" element={<GrantsPage />} />
          <Route path="/recipients" element={<RecipientsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
      </MainLayout>
    </Router>
  )
}

export default App