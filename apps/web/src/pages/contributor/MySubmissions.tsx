import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RoleGate } from '../../components/RoleGate';
import { Icon } from '../../components/icons';
import { fetchMeApi } from '../../api/auth';

export const MySubmissions: React.FC = () => {
  const { data: meData } = useQuery({ queryKey: ['me'], queryFn: fetchMeApi });
  const currentUser = meData?.user;

  const { data, isLoading } = useQuery({
    queryKey: ['mySubmissions', currentUser?._id],
    queryFn: async () => {
      if (!currentUser?._id) return { translations: [] };
      const res = await fetch(`/api/articles?authorId=${currentUser._id}&limit=50`);
      if (!res.ok) throw new Error('Failed to load submissions');
      return res.json();
    },
    enabled: Boolean(currentUser?._id),
  });

  const statusStyles: Record<string, string> = {
    draft: 'bg-slate-800 text-slate-300 border-slate-700',
    in_review: 'bg-amber-950/50 text-amber-400 border-amber-800/60',
    changes_requested: 'bg-rose-950/50 text-rose-400 border-rose-800/60',
    published: 'bg-emerald-950/50 text-emerald-400 border-emerald-800/60',
    archived: 'bg-gray-800 text-gray-400 border-gray-700',
  };

  return (
    <RoleGate allowedRoles={['contributor', 'super_admin']}>
      <div className="max-w-5xl mx-auto p-6 space-y-6 text-xs text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
              Contributor Portal
            </span>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">My Authored Submissions</h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Track review status and editorial review notes for your articles across English and Amharic.
            </p>
          </div>

          <Link
            to="/editor/new"
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--bg-secondary)] font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
          >
            <Icon name="plus" size={14} />
            <span>Create New Article</span>
          </Link>
        </div>

        {/* Submissions List */}
        <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-sm space-y-4">
          {isLoading ? (
            <div className="p-6 text-center text-[var(--text-muted)] italic">Loading your submissions...</div>
          ) : data?.translations?.length > 0 ? (
            <div className="divide-y divide-[var(--border)]">
              {data.translations.map((t: any) => (
                <div key={t._id} className="py-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-[var(--accent)]">
                          [{t.language}]
                        </span>
                        <h3 className="font-bold text-sm text-[var(--text-primary)]">{t.title}</h3>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">
                        Slug: /{t.language}/articles/{t.slug} • Last Updated: {new Date(t.updatedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                          statusStyles[t.status] || statusStyles.draft
                        }`}
                      >
                        {t.status.replace('_', ' ')}
                      </span>

                      <Link
                        to={`/editor/${t.articleId}/${t.language}`}
                        className="px-3.5 py-1.5 rounded bg-[var(--accent)] text-[var(--bg-secondary)] font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-1"
                      >
                        <span>Open Editor</span>
                        <Icon name="chevron-right" size={12} />
                      </Link>
                    </div>
                  </div>

                  {/* Super Admin Review Notes callout if changes requested (Prompt 12 §116-118) */}
                  {t.status === 'changes_requested' && t.reviewNotes && (
                    <div className="p-3 rounded-lg border border-rose-800/60 bg-rose-950/30 text-rose-300 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-rose-400">
                        <Icon name="warning" size={14} />
                        <span>Editorial Review Notes from Super Admin:</span>
                      </div>
                      <p className="italic pl-5">{t.reviewNotes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-[var(--text-muted)] space-y-3">
              <Icon name="file-text" size={32} className="mx-auto text-[var(--border)]" />
              <p className="font-semibold text-sm">You haven't authored any articles yet.</p>
              <Link
                to="/editor/new"
                className="inline-block px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--bg-secondary)] font-bold text-xs hover:opacity-90 transition-opacity"
              >
                Create Your First Article →
              </Link>
            </div>
          )}
        </div>
      </div>
    </RoleGate>
  );
};

export default MySubmissions;
