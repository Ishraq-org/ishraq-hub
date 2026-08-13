import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoleGate } from '../../components/RoleGate';

interface InquiryItem {
  _id: string;
  telegramUserId: string;
  telegramUsername?: string | null;
  message: string;
  status: 'new' | 'reviewed';
  createdAt: string;
}

export const AdminInquiries: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['adminInquiries', page],
    queryFn: async () => {
      const res = await fetch(`/api/admin/inquiries?page=${page}&limit=20`);
      if (!res.ok) throw new Error('Failed to load inquiries');
      return res.json();
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'new' | 'reviewed' }) => {
      const res = await fetch(`/api/admin/inquiries/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to update inquiry status');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInquiries'] });
    },
  });

  const inquiries: InquiryItem[] = data?.inquiries || [];
  const pagination = data?.pagination;

  return (
    <RoleGate allowedRoles={['super_admin']}>
      <div className="max-w-6xl mx-auto p-6 space-y-6 text-xs text-[var(--text-primary)]">
        {/* Header */}
        <div className="border-b border-[var(--border)] pb-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] font-mono">
            Telegram Bot Inquiries
          </span>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">User Inquiries & Messages</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Review user messages captured from the Ishraq Hub Telegram bot.
          </p>
        </div>

        {/* Table Container */}
        <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-sm space-y-4">
          {isLoading ? (
            <div className="p-12 text-center text-[var(--text-muted)] italic">Loading inquiries...</div>
          ) : inquiries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[10px] uppercase font-bold text-[var(--accent)] font-mono">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Telegram User</th>
                    <th className="py-2.5 px-3">Message</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {inquiries.map((item) => (
                    <tr key={item._id} className="hover:bg-[var(--bg-primary)]/50 transition-colors">
                      <td className="py-3 px-3 text-[10px] font-mono text-[var(--text-muted)] whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-[var(--text-primary)]">
                          {item.telegramUsername ? `@${item.telegramUsername}` : `ID: ${item.telegramUserId}`}
                        </p>
                        {item.telegramUsername && (
                          <span className="text-[10px] font-mono text-[var(--text-muted)]">
                            ID: {item.telegramUserId}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 max-w-md">
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{item.message}</p>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'new'
                              ? 'bg-amber-950/50 text-amber-400 border-amber-800/60'
                              : 'bg-emerald-950/50 text-emerald-400 border-emerald-800/60'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        {item.status === 'new' ? (
                          <button
                            type="button"
                            onClick={() => statusMutation.mutate({ id: item._id, status: 'reviewed' })}
                            className="px-3 py-1 rounded bg-[var(--accent)] text-[var(--bg-secondary)] font-bold text-[11px] hover:opacity-90 transition-opacity"
                          >
                            Mark Reviewed
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => statusMutation.mutate({ id: item._id, status: 'new' })}
                            className="px-2.5 py-1 rounded border border-[var(--border)] hover:bg-[var(--bg-primary)] text-[11px] text-[var(--text-muted)]"
                          >
                            Re-open
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-[var(--text-muted)] italic">No inquiries received yet.</div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs">
              <span className="text-[var(--text-muted)]">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded border border-[var(--border)] disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 rounded border border-[var(--border)] disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleGate>
  );
};

export default AdminInquiries;
