import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RoleGate } from '../../components/RoleGate';
import { Icon } from '../../components/icons';

export const AdminArticles: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [page, setPage] = useState<number>(1);

  const { data, isLoading } = useQuery({
    queryKey: ['adminArticles', activeTab, page],
    queryFn: async () => {
      const statusQuery = activeTab !== 'all' ? `&status=${activeTab}` : '';
      const res = await fetch(`/api/articles?page=${page}&limit=10${statusQuery}`);
      if (!res.ok) throw new Error('Failed to load articles');
      return res.json();
    },
  });

  const tabs = [
    { id: 'all', label: 'All Content' },
    { id: 'in_review', label: 'Pending Review' },
    { id: 'draft', label: 'Drafts' },
    { id: 'changes_requested', label: 'Changes Requested' },
    { id: 'published', label: 'Published' },
    { id: 'archived', label: 'Archived' },
  ];

  const statusStyles: Record<string, string> = {
    draft: 'bg-slate-800 text-slate-300 border-slate-700',
    in_review: 'bg-amber-950/50 text-amber-400 border-amber-800/60',
    changes_requested: 'bg-rose-950/50 text-rose-400 border-rose-800/60',
    published: 'bg-emerald-950/50 text-emerald-400 border-emerald-800/60',
    archived: 'bg-gray-800 text-gray-400 border-gray-700',
  };

  return (
    <RoleGate allowedRoles={['super_admin']}>
      <div className="max-w-6xl mx-auto p-6 space-y-6 text-xs text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
              Editorial Queue
            </span>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">All Platform Articles</h1>
          </div>

          <Link
            to="/editor/new"
            className="px-3.5 py-2 rounded-lg bg-[var(--accent)] text-[var(--bg-secondary)] font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
          >
            <Icon name="plus" size={14} />
            <span>Create Article</span>
          </Link>
        </div>

        {/* Status Filter Tabs (Prompt 12 §96-97) */}
        <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--accent)] text-[var(--bg-secondary)] shadow-sm'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Articles List Table */}
        <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-sm space-y-4">
          {isLoading ? (
            <div className="p-6 text-center text-[var(--text-muted)] italic">Loading article queue...</div>
          ) : data?.translations?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[10px] uppercase font-bold text-[var(--accent)]">
                    <th className="py-2.5 px-3">Title & Path</th>
                    <th className="py-2.5 px-3">Language</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Last Updated</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {data.translations.map((t: any) => (
                    <tr key={t._id} className="hover:bg-[var(--bg-primary)]/50 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-bold text-[var(--text-primary)]">{t.title}</p>
                        <p className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">
                          /{t.language}/articles/{t.slug}
                        </p>
                      </td>
                      <td className="py-3 px-3 uppercase font-mono font-bold text-[var(--accent)]">
                        {t.language}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                            statusStyles[t.status] || statusStyles.draft
                          }`}
                        >
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[10px] text-[var(--text-muted)] font-mono">
                        {new Date(t.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          to={`/editor/${t.articleId}/${t.language}`}
                          className="px-3 py-1 rounded bg-[var(--accent)] text-[var(--bg-secondary)] font-bold text-xs hover:opacity-90 transition-opacity inline-flex items-center gap-1"
                        >
                          <span>Open Editor</span>
                          <Icon name="chevron-right" size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-[var(--text-muted)] italic">
              No articles found matching status filter '{activeTab}'.
            </div>
          )}
        </div>
      </div>
    </RoleGate>
  );
};

export default AdminArticles;
