// src/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import HomePage from "@/pages/HomePage";
import SearchPage from "@/pages/SearchPage";
import PopularSearchesPage from "@/pages/PopularSearchesPage";
import InstitutesPage from "@/pages/InstitutesPage";
import InstituteProfilePage from "@/pages/InstituteProfilePage";
import RecipientsPage from "@/pages/RecipientsPage";
import RecipientProfilePage from "@/pages/RecipientProfilePage";
import BookmarksPage from "@/pages/BookmarksPage";
import TrendsPage from "@/pages/TrendsPage";
import AuthPage from "@/pages/AuthPage";
import AccountPage from "@/pages/AccountPage";
import PageNotFound from "@/pages/PageNotFound";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    return user ? <>{children}</> : <Navigate to="/auth" replace />;
};

function App() {
    const { user } = useAuth();

    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <MainLayout>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/search/popular" element={<PopularSearchesPage />} />
                        <Route
                            path="/institutes"
                            element={<InstitutesPage />}
                        />
                        <Route
                            path="/institutes/:id"
                            element={<InstituteProfilePage />}
                        />
                        <Route
                            path="/recipients"
                            element={<RecipientsPage />}
                        />
                        <Route
                            path="/recipients/:id"
                            element={<RecipientProfilePage />}
                        />
                        <Route
                            path="/bookmarks"
                            element={
                                <ProtectedRoute>
                                    <BookmarksPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/trends" element={<TrendsPage />} />
                        <Route
                            path="/auth"
                            element={
                                user ? (
                                    <Navigate to="/account" replace />
                                ) : (
                                    <AuthPage />
                                )
                            }
                        />
                        <Route
                            path="/account"
                            element={
                                <ProtectedRoute>
                                    <AccountPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="*" element={<PageNotFound />} />
                    </Routes>
                </MainLayout>
            </Router>
        </QueryClientProvider>
    );
}

export default App;
