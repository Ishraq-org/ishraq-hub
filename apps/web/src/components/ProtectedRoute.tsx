import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchMeApi } from '../api/auth';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="flex flex-col items-center space-y-4">
        {/* Placeholder geometric loading mark in --accent per Master Prompt §4.3 */}
        <div className="w-12 h-12 border-4 border-t-[var(--accent)] border-[var(--border)] rounded-full animate-spin" />
        <p className="text-sm font-medium text-[var(--text-muted)]">Loading Ishraq Hub...</p>
      </div>
    </div>
  );
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();

  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMeApi,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!data?.user) {
    const redirectPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectPath}`} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
