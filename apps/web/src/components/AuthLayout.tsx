import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
      <main className="flex-1 flex flex-col items-center justify-center">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
