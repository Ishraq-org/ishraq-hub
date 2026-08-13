import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { Icon } from './components/icons';
import { fetchMeApi } from './api/auth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleGate } from './components/RoleGate';
import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';
import Home from './pages/Home';
import BrowseTopicsPage from './pages/browse/BrowseTopicsPage';
import BrowseTopicDetailPage from './pages/browse/BrowseTopicDetailPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import PolicyPage from './pages/policy/PolicyPage';
import NewArticlePage from './pages/editor/NewArticlePage';
import ArticleEditorPage from './pages/editor/ArticleEditorPage';
import ArticleReadingPage from './pages/article/ArticleReadingPage';
import AdminDashboard from './pages/admin/Dashboard';
import AdminTopics from './pages/admin/Topics';
import AdminArticles from './pages/admin/Articles';
import AdminUsers from './pages/admin/Users';
import AdminSponsors from './pages/admin/Sponsors';
import MySubmissions from './pages/contributor/MySubmissions';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

/* Protected Dashboard Component */
const ProtectedDashboardDemo: React.FC = () => {
  const { data } = useQuery({ queryKey: ['me'], queryFn: fetchMeApi });
  const user = data?.user;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full p-8 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] shadow-md space-y-4 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
          <Icon name="check-circle" size={28} />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Protected Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Welcome <strong className="text-[var(--text-primary)]">{user?.name}</strong>! You successfully passed the <code className="font-mono text-xs">ProtectedRoute</code> check.
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {user?.role === 'super_admin' && (
            <Link
              to="/admin"
              className="inline-block text-xs font-semibold px-4 py-2 rounded bg-[var(--accent)] text-[var(--bg-secondary)] hover:opacity-90 transition-opacity"
            >
              Go to Admin Panel →
            </Link>
          )}
          {(user?.role === 'contributor' || user?.role === 'super_admin') && (
            <Link
              to="/contributor/my-submissions"
              className="inline-block text-xs font-semibold px-4 py-2 rounded border border-[var(--border)] bg-[var(--bg-primary)] hover:bg-[var(--border)] transition-colors"
            >
              My Submissions →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Article Reading Page (Standalone Header & Layout) */}
            <Route path="/:language/articles/:slug" element={<ArticleReadingPage />} />

            {/* Main Application Layout Wrapper */}
            <Route element={<Layout />}>
              {/* Homepage Landing Explainer (Prompt 15 §46-72) */}
              <Route path="/" element={<Home />} />

              {/* Public Topic Directory & Detail Browse Routes (Prompt 15 §73-88) */}
              <Route path="/:lang/topics" element={<BrowseTopicsPage />} />
              <Route path="/:lang/topics/:slug" element={<BrowseTopicDetailPage />} />

              {/* Static Policy Routes */}
              <Route path="/privacy" element={<PolicyPage />} />
              <Route path="/terms" element={<PolicyPage />} />
              <Route path="/cookies" element={<PolicyPage />} />
              <Route path="/disclaimer" element={<PolicyPage />} />
              <Route path="/advertising" element={<PolicyPage />} />

              {/* Protected Member & Admin Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <ProtectedDashboardDemo />
                  </ProtectedRoute>
                }
              />

              {/* Contributor Portal Route */}
              <Route
                path="/contributor/my-submissions"
                element={
                  <ProtectedRoute>
                    <RoleGate allowedRoles={['contributor', 'super_admin']}>
                      <MySubmissions />
                    </RoleGate>
                  </ProtectedRoute>
                }
              />

              {/* Admin Panel Routes (Super Admin Only) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <RoleGate allowedRoles={['super_admin']}>
                      <AdminDashboard />
                    </RoleGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/topics"
                element={
                  <ProtectedRoute>
                    <RoleGate allowedRoles={['super_admin']}>
                      <AdminTopics />
                    </RoleGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/articles"
                element={
                  <ProtectedRoute>
                    <RoleGate allowedRoles={['super_admin']}>
                      <AdminArticles />
                    </RoleGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute>
                    <RoleGate allowedRoles={['super_admin']}>
                      <AdminUsers />
                    </RoleGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/sponsors"
                element={
                  <ProtectedRoute>
                    <RoleGate allowedRoles={['super_admin']}>
                      <AdminSponsors />
                    </RoleGate>
                  </ProtectedRoute>
                }
              />

              {/* Editor Routes */}
              <Route
                path="/editor/new"
                element={
                  <ProtectedRoute>
                    <RoleGate allowedRoles={['contributor', 'super_admin']}>
                      <NewArticlePage />
                    </RoleGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editor/:articleId/:language"
                element={
                  <ProtectedRoute>
                    <RoleGate allowedRoles={['contributor', 'super_admin']}>
                      <ArticleEditorPage />
                    </RoleGate>
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Auth Layout Wrapper */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
