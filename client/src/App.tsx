import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import { HomePage } from './pages/HomePage'
import { SearchPage } from './pages/SearchPage'
import { InstitutesPage } from './pages/InstitutesPage'
import InstituteProfilePage from './pages/InstituteProfilePage'
import { RecipientsPage } from './pages/RecipientsPage'
import { RecipientProfilePage } from './pages/RecipientProfilePage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { BookmarksPage } from './pages/BookmarksPage'

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/institutes" element={<InstitutesPage />} />
          <Route path="/institutes/:id" element={<InstituteProfilePage />} />
          <Route path="/recipients" element={<RecipientsPage />} />
          <Route path="/recipients/:id" element={<RecipientProfilePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
        </Routes>
      </MainLayout>
    </Router>
  )
}

export default App