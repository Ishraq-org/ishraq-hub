import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RoleGate } from '../../components/RoleGate';
import { Icon } from '../../components/icons';

export const AdminDashboard: React.FC = () => {
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/dashboard-stats');
      if (!res.ok) throw new Error('Failed to load stats');
      return res.json();
    },
  });

  const { data: feedData, isLoading: isFeedLoading } = useQuery({
    queryKey: ['adminFeed'],
    queryFn: async () => {
      const res = await fetch('/api/admin/activity-feed');
      if (!res.ok) throw new Error('Failed to load feed');
      return res.json();
    },
  });

  return (
    <RoleGate allowedRoles={['super_admin']}>
      <div className="max-w-6xl mx-auto p-6 space-y-8 text-xs text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
              Admin Operations Center
            </span>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">
              Ishraq Hub Admin Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/editor/new"
              className="px-3.5 py-2 rounded-lg bg-[var(--accent)] text-[var(--bg-secondary)] font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
            >
              <Icon name="plus" size={14} />
              <span>New Article</span>
            </Link>
            <Link
              to="/admin/topics"
              className="px-3.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold text-xs hover:bg-[var(--bg-primary)] transition-colors flex items-center gap-1.5"
            >
              <Icon name="folder" size={14} />
              <span>Manage Topics</span>
            </Link>
          </div>
        </div>

        {/* 1. Stats Cards Grid (Prompt 12 §19-26) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[var(--accent)] font-bold">
              <span>Total Platform Users</span>
              <Icon name="user" size={18} />
            </div>
            <p className="text-3xl font-extrabold text-[var(--text-primary)]">
              {isStatsLoading ? '...' : statsData?.totalUsers ?? 0}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">Registered Members & Authors</p>
          </div>

          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-sky-400 font-bold">
              <span>Total Articles Shells</span>
              <Icon name="book-open" size={18} />
            </div>
            <p className="text-3xl font-extrabold text-[var(--text-primary)]">
              {isStatsLoading ? '...' : statsData?.totalArticles ?? 0}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">Multilingual Content Shells</p>
          </div>

          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-amber-400 font-bold">
              <span>Pending Reviews</span>
              <Icon name="clock" size={18} />
            </div>
            <p className="text-3xl font-extrabold text-amber-400">
              {isStatsLoading ? '...' : statsData?.pendingReviewCount ?? 0}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">Awaiting Super Admin Approval</p>
          </div>

          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span>Topic Hierarchy</span>
              <Icon name="folder" size={18} />
            </div>
            <p className="text-3xl font-extrabold text-[var(--text-primary)]">
              {isStatsLoading ? '...' : statsData?.totalTopics ?? 0}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">Taxonomy Categories</p>
          </div>
        </div>

        {/* 2. Derived Activity Feed Timeline (Prompt 12 §28-36) */}
        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h2 className="text-sm font-bold text-[var(--accent)] flex items-center gap-2">
              <Icon name="activity" size={16} />
              <span>Derived Live Activity Feed</span>
            </h2>
            <span className="text-[10px] text-[var(--text-muted)] italic">Recent 15 Combined Events</span>
          </div>

          {isFeedLoading ? (
            <div className="p-6 text-center text-[var(--text-muted)] italic">Loading activity feed...</div>
          ) : feedData?.feed?.length > 0 ? (
            <div className="divide-y divide-[var(--border)]">
              {feedData.feed.map((item: any) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        item.type === 'article'
                          ? 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20'
                          : 'bg-sky-950/40 text-sky-400 border border-sky-800/40'
                      }`}
                    >
                      <Icon name={item.type === 'article' ? 'file-text' : 'user'} size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">
                        {item.actorName} <span className="font-normal text-[var(--text-muted)]">— {item.action}</span>
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">
                        "{item.title}" {item.language ? `(${item.language.toUpperCase()})` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right whitespace-nowrap">
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-[var(--text-muted)] italic">No recent activity events found.</div>
          )}
        </div>
      </div>
    </RoleGate>
  );
};

export default AdminDashboard;
