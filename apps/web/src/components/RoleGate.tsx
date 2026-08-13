import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMeApi } from '../api/auth';
import { UserRole } from '@ishraq/shared-types';
import { LoadingScreen } from './ProtectedRoute';
import { Icon } from './icons';

interface RoleGateProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGate: React.FC<RoleGateProps> = ({
  allowedRoles,
  children,
  fallback,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMeApi,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  const userRole = data?.user?.role as UserRole | undefined;
  const isAuthorized = userRole && allowedRoles.includes(userRole);

  if (!isAuthorized) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="max-w-md w-full p-8 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] shadow-md text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center text-[var(--danger)]">
            <Icon name="alert-circle" size={24} />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Access Restricted</h2>
          <p className="text-sm text-[var(--text-muted)]">
            You do not have permission to view this page. Required role:{' '}
            <span className="font-semibold text-[var(--accent)]">{allowedRoles.join(', ')}</span>.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGate;
