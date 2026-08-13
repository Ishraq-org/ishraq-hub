import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useSearchParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { Icon } from './components/icons';
import { fetchMeApi } from './api/auth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleGate } from './components/RoleGate';
import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import PolicyPage from './pages/policy/PolicyPage';
import NewArticlePage from './pages/editor/NewArticlePage';
import ArticleEditorPage from './pages/editor/ArticleEditorPage';
import useT from './hooks/useT';

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
  const { language } = useT();

  const { data } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMeApi,
    retry: false,
  });

  const user = data?.user;
  const isUnverified = user && !user.emailVerified;
  const showUnverifiedBanner = (isUnverified || searchParams.get('verified') === 'false') && !dismissBanner;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full space-y-8">
      {/* Top Banner for unverified users */}
      {showUnverifiedBanner && (
        <div className="w-full bg-[var(--accent)] text-[var(--bg-secondary)] px-4 py-2.5 rounded-lg flex items-center justify-between text-xs font-medium shadow-sm">
          <div className="flex items-center gap-2">
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

      {/* Hero Content */}
      <div className="text-center space-y-4 pt-6">
        <span className="inline-block px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--accent)] font-mono text-xs uppercase tracking-wider font-semibold">
          Wikipedia-Style Apologetics Hub
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
          Ishraq Hub
        </h1>
        <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
          Illuminating the Ummah with knowledge-centric Islamic apologetics and educational research across English and Amharic.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-[var(--accent)] flex items-center gap-2">
            <Icon name="lock" size={20} /> Protected Member Dashboard
          </h2>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Protected by `ProtectedRoute` wrapper requiring valid `ishraq_session` cookie authentication.
          </p>
          <Link
            to="/dashboard"
            className="inline-block text-xs font-semibold px-4 py-2 rounded bg-[var(--accent)] text-[var(--bg-secondary)] hover:bg-[var(--accent-hover)] transition-colors"
          >
            Access Dashboard →
          </Link>
        </div>

        <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-[var(--accent)] flex items-center gap-2">
            <Icon name="user" size={20} /> Multilingual Topic Routing
          </h2>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Content routes are language-prefixed for SEO: `/{language}/topics` or `/{language}/topics/shubha-refutations`.
          </p>
          <Link
            to={`/${language}/topics`}
            className="inline-block text-xs font-semibold px-4 py-2 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
          >
            Browse Topics ({language.toUpperCase()}) →
          </Link>
        </div>
      </div>
    </div>
  );
};

/* Language Prefixed Topic Placeholder Screen */
const TopicPlaceholder: React.FC = () => {
  const { lang, slug } = useParams<{ lang: string; slug?: string }>();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] mx-auto font-bold text-lg">
        {lang?.toUpperCase() || 'EN'}
      </div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        {slug ? `Topic: ${slug}` : 'Topics Directory'}
      </h1>
      <p className="text-xs text-[var(--text-muted)]">
        Language Prefix: <code className="font-mono text-[var(--accent)]">/{lang}</code>
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-block text-xs font-semibold px-4 py-2 rounded border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--border)] transition-colors"
        >
          ← Back Home
        </Link>
      </div>
    </div>
  );
};

/* Language Prefixed Article Placeholder Screen */
const ArticlePlaceholder: React.FC = () => {
  const { lang, slug } = useParams<{ lang: string; slug: string }>();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] mx-auto font-bold text-lg">
        {lang?.toUpperCase() || 'EN'}
      </div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        Article Slug: {slug}
      </h1>
      <p className="text-xs text-[var(--text-muted)]">
        Language Route: <code className="font-mono text-[var(--accent)]">/{lang}/articles/{slug}</code>
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-block text-xs font-semibold px-4 py-2 rounded border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--border)] transition-colors"
        >
          ← Back Home
        </Link>
      </div>
    </div>
  );
};

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
            {/* Main Application Layout Wrapper */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />

              {/* Language-Prefixed Content Routes */}
              <Route path="/:lang/topics" element={<TopicPlaceholder />} />
              <Route path="/:lang/topics/:slug" element={<TopicPlaceholder />} />
              <Route path="/:lang/articles/:slug" element={<ArticlePlaceholder />} />

              {/* Static Policy Placeholder Routes (Unprefixed) */}
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
              {/* Editor Routes (Protected for Contributors & Super Admins) */}
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

            {/* Auth Layout Wrapper (Stripped-Down Chrome) */}
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
