import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, ThemeToggle, useTheme } from './context/ThemeContext';
import { Icon } from './components/icons';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      refetchOnWindowFocus: false,
    },
  },
});

const ContentDemo: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
      <div className="max-w-xl w-full p-8 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Ishraq Hub</h1>
            <p className="text-sm text-[var(--text-muted)]">Islamic Knowledge & Apologetics Platform</p>
          </div>
          <ThemeToggle />
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[var(--accent)]">Theme System Active</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Current mode: <span className="font-mono px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--accent)]">{theme}</span>
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            Theme custom properties (<code className="font-mono text-xs">--bg-primary</code>, <code className="font-mono text-xs">--accent</code>, etc.) are strictly active across light and dark modes without hardcoded color utilities.
          </p>
        </div>

        <div className="pt-4 border-t border-[var(--border)] space-y-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Registered System Icons</h3>
          <div className="flex flex-wrap items-center gap-4 text-[var(--text-secondary)]">
            <div className="flex items-center gap-1.5 text-xs"><Icon name="sun" size={16} /> Sun</div>
            <div className="flex items-center gap-1.5 text-xs"><Icon name="moon" size={16} /> Moon</div>
            <div className="flex items-center gap-1.5 text-xs"><Icon name="menu" size={16} /> Menu</div>
            <div className="flex items-center gap-1.5 text-xs"><Icon name="search" size={16} /> Search</div>
            <div className="flex items-center gap-1.5 text-xs"><Icon name="close" size={16} /> Close</div>
            <div className="flex items-center gap-1.5 text-xs"><Icon name="chevron-down" size={16} /> Chevron</div>
            <div className="flex items-center gap-1.5 text-xs"><Icon name="user" size={16} /> User</div>
            <div className="flex items-center gap-1.5 text-xs"><Icon name="external-link" size={16} /> External</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ContentDemo />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
