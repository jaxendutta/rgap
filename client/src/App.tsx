import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import HomePage from './pages/HomePage'
import { SearchPage } from './pages/SearchPage'
import { InstitutesPage } from './pages/InstitutesPage'
import InstituteProfilePage from './pages/InstituteProfilePage'
import { RecipientsPage } from './pages/RecipientsPage'
import { RecipientProfilePage } from './pages/RecipientProfilePage'
import { BookmarksPage } from './pages/BookmarksPage'
import DocsPage from './pages/DocsPage'
import PageNotFound from './pages/PageNotFound'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/institutes" element={<InstitutesPage />} />
            <Route path="/institutes/:id" element={<InstituteProfilePage />} />
            <Route path="/recipients" element={<RecipientsPage />} />
            <Route path="/recipients/:id" element={<RecipientProfilePage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </MainLayout>
      </Router>
    </QueryClientProvider>
  )
}

export default App