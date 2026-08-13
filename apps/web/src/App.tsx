import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useSearchParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ThemeProvider, ThemeToggle } from './context/ThemeContext';
import { Icon } from './components/icons';
import { fetchMeApi, logoutApi } from './api/auth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleGate } from './components/RoleGate';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const HomePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [dismissBanner, setDismissBanner] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMeApi,
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.setQueryData(['me'], null);
    },
  });

  const user = data?.user;
  const isUnverified = user && !user.emailVerified;
  const showUnverifiedBanner = (isUnverified || searchParams.get('verified') === 'false') && !dismissBanner;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
      {/* Top Banner for unverified users */}
      {showUnverifiedBanner && (
        <div className="bg-[var(--accent)] text-[var(--bg-secondary)] px-4 py-2.5 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <Icon name="mail" size={16} />
            <span>Please check your inbox to verify your email address. Unverified accounts have restricted access.</span>
          </div>
          <button
            type="button"
            onClick={() => setDismissBanner(true)}
            className="hover:opacity-80 transition-opacity p-1"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}

      {/* Navigation Header */}
      <header className="border-b border-[var(--border)] bg-[var(--bg-secondary)] px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-[var(--accent)] tracking-tight">
          Ishraq Hub
        </Link>
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-t-[var(--accent)] border-[var(--border)] rounded-full animate-spin" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--text-muted)]">
                Logged in as <strong className="text-[var(--text-primary)]">{user.name}</strong> ({user.role})
              </span>
              <button
                type="button"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="text-xs font-semibold px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] hover:bg-[var(--border)] transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-semibold px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-semibold px-3 py-1.5 rounded bg-[var(--accent)] text-[var(--bg-secondary)] hover:bg-[var(--accent-hover)] transition-colors"
              >
                Register
              </Link>
            </div>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Body */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Wikipedia-Style Research Hub
          </h1>
          <p className="text-base text-[var(--text-muted)] max-w-xl mx-auto">
            Knowledge-centric Islamic apologetics and educational platform for the Ethiopian Ummah and beyond.
          </p>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] space-y-3">
            <h2 className="text-lg font-bold text-[var(--accent)] flex items-center gap-2">
              <Icon name="lock" size={20} /> Protected Member Route
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Requires an active authenticated session (`ishraq_session` cookie). Redirects to login if logged out.
            </p>
            <Link
              to="/dashboard"
              className="inline-block text-xs font-semibold px-4 py-2 rounded bg-[var(--accent)] text-[var(--bg-secondary)] hover:bg-[var(--accent-hover)] transition-colors"
            >
              Access Member Area →
            </Link>
          </div>

          <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] space-y-3">
            <h2 className="text-lg font-bold text-[var(--accent)] flex items-center gap-2">
              <Icon name="user" size={20} /> Role-Gated Admin Area
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Requires `contributor` or `super_admin` role permissions via `RoleGate`.
            </p>
            <Link
              to="/admin-demo"
              className="inline-block text-xs font-semibold px-4 py-2 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
            >
              Test Role Gate →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

const ProtectedDashboardDemo: React.FC = () => {
  const { data } = useQuery({ queryKey: ['me'], queryFn: fetchMeApi });
  const user = data?.user;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-md w-full p-8 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] shadow-md space-y-4 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
          <Icon name="check-circle" size={28} />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Protected Member Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Welcome <strong className="text-[var(--text-primary)]">{user?.name}</strong>! You successfully passed the <code className="font-mono text-xs">ProtectedRoute</code> check via cookie authentication.
        </p>
        <Link
          to="/"
          className="inline-block text-xs font-semibold px-4 py-2 rounded border border-[var(--border)] bg-[var(--bg-primary)] hover:bg-[var(--border)] transition-colors mt-2"
        >
          ← Return to Home
        </Link>
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
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ProtectedDashboardDemo />
                </ProtectedRoute>
              }
            />

            {/* Role Gated Demo Route */}
            <Route
              path="/admin-demo"
              element={
                <ProtectedRoute>
                  <RoleGate allowedRoles={['contributor', 'super_admin']}>
                    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-primary)]">
                      <div className="max-w-md w-full p-8 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-center space-y-3">
                        <h1 className="text-xl font-bold text-[var(--accent)]">Contributor / Admin Dashboard</h1>
                        <p className="text-xs text-[var(--text-muted)]">You have elevated permissions (`contributor` or `super_admin`).</p>
                        <Link to="/" className="inline-block text-xs font-semibold text-[var(--accent)] mt-2">← Back Home</Link>
                      </div>
                    </div>
                  </RoleGate>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
