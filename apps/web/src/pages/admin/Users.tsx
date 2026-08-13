import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoleGate } from '../../components/RoleGate';
import { Icon } from '../../components/icons';

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: 'member' | 'contributor' | 'super_admin';
  isBanned: boolean;
  banReason?: string | null;
  createdAt: string;
}

export const AdminUsers: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [bannedFilter, setBannedFilter] = useState('');
  const [banTargetUser, setBanTargetUser] = useState<UserItem | null>(null);
  const [banReasonInput, setBanReasonInput] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', searchQuery, roleFilter, bannedFilter],
    queryFn: async () => {
      const q = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : '';
      const r = roleFilter ? `&role=${roleFilter}` : '';
      const b = bannedFilter ? `&isBanned=${bannedFilter}` : '';
      const res = await fetch(`/api/admin/users?limit=20${q}${r}${b}`);
      if (!res.ok) throw new Error('Failed to load users');
      return res.json();
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to update role');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  const banMutation = useMutation({
    mutationFn: async ({ userId, isBanned, banReason }: { userId: string; isBanned: boolean; banReason?: string }) => {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned, banReason }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to update ban status');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setBanTargetUser(null);
      setBanReasonInput('');
    },
  });

  const handleConfirmBanToggle = () => {
    if (!banTargetUser) return;
    banMutation.mutate({
      userId: banTargetUser._id,
      isBanned: !banTargetUser.isBanned,
      banReason: banReasonInput,
    });
  };

  return (
    <RoleGate allowedRoles={['super_admin']}>
      <div className="max-w-6xl mx-auto p-6 space-y-6 text-xs text-[var(--text-primary)]">
        {/* Header */}
        <div className="border-b border-[var(--border)] pb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
            User Administration
          </span>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">User Accounts & Access Control</h1>
        </div>

        {/* Filters Bar */}
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] flex flex-wrap items-center gap-3 shadow-sm">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none text-xs"
            />
            <div className="absolute left-3 top-2 text-[var(--text-muted)]">
              <Icon name="search" size={14} />
            </div>
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none text-xs"
          >
            <option value="">All Roles</option>
            <option value="member">Member</option>
            <option value="contributor">Contributor</option>
            <option value="super_admin">Super Admin</option>
          </select>

          <select
            value={bannedFilter}
            onChange={(e) => setBannedFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none text-xs"
          >
            <option value="">All Statuses</option>
            <option value="false">Active Only</option>
            <option value="true">Banned Only</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-sm">
          {isLoading ? (
            <div className="p-6 text-center text-[var(--text-muted)] italic">Loading users list...</div>
          ) : data?.users?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[10px] uppercase font-bold text-[var(--accent)]">
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Joined Date</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {data.users.map((u: UserItem) => (
                    <tr key={u._id} className="hover:bg-[var(--bg-primary)]/50 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-bold text-[var(--text-primary)]">{u.name}</p>
                        <p className="text-[10px] text-[var(--text-muted)] font-mono">{u.email}</p>
                      </td>

                      {/* Role Selector */}
                      <td className="py-3 px-3">
                        <select
                          value={u.role}
                          onChange={(e) => roleMutation.mutate({ userId: u._id, role: e.target.value })}
                          className="px-2 py-1 rounded border border-[var(--border)] bg-[var(--bg-primary)] font-bold text-[11px] focus:outline-none"
                        >
                          <option value="member">Member</option>
                          <option value="contributor">Contributor</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </td>

                      {/* Ban Status Badge */}
                      <td className="py-3 px-3">
                        {u.isBanned ? (
                          <span
                            className="px-2.5 py-0.5 rounded-full border border-rose-800/60 bg-rose-950/40 text-rose-400 text-[10px] font-bold uppercase tracking-wider cursor-help"
                            title={u.banReason || 'Banned'}
                          >
                            Banned
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full border border-emerald-800/60 bg-emerald-950/40 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-[10px] text-[var(--text-muted)] font-mono">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setBanTargetUser(u);
                            setBanReasonInput(u.banReason || '');
                          }}
                          className={`px-3 py-1 rounded font-bold text-xs transition-colors ${
                            u.isBanned
                              ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/60'
                              : 'bg-rose-950/50 text-rose-400 border border-rose-800/60 hover:bg-rose-900/60'
                          }`}
                        >
                          {u.isBanned ? 'Unban User' : 'Ban User'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-[var(--text-muted)] italic">No users found.</div>
          )}
        </div>

        {/* Ban Confirmation Modal (Prompt 12 §108-110) */}
        {banTargetUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="max-w-md w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5 shadow-2xl space-y-4 text-xs text-[var(--text-primary)]">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-2 font-bold text-sm text-rose-400">
                  <Icon name="warning" size={18} />
                  <span>{banTargetUser.isBanned ? 'Unban User Account' : 'Ban User Account'}</span>
                </div>
                <button type="button" onClick={() => setBanTargetUser(null)} className="p-1 rounded hover:bg-[var(--bg-primary)]">
                  <Icon name="close" size={16} />
                </button>
              </div>

              <p className="leading-relaxed">
                Target User: <strong className="text-[var(--text-primary)]">{banTargetUser.name}</strong> ({banTargetUser.email}).
                {!banTargetUser.isBanned && ' Banning will instantly revoke their active session across all devices.'}
              </p>

              {!banTargetUser.isBanned && (
                <div>
                  <label className="block font-semibold mb-1">Ban Reason (Required)</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Enter reason for banning user account..."
                    value={banReasonInput}
                    onChange={(e) => setBanReasonInput(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                  />
                </div>
              )}

              {banMutation.isError && (
                <div className="p-2 rounded bg-rose-950/40 border border-rose-800/60 text-rose-300 text-[11px]">
                  {(banMutation.error as Error).message}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBanTargetUser(null)}
                  className="px-4 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--bg-primary)] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={banMutation.isPending}
                  onClick={handleConfirmBanToggle}
                  className={`px-4 py-1.5 rounded font-bold text-white transition-colors ${
                    banTargetUser.isBanned
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {banMutation.isPending
                    ? 'Updating...'
                    : banTargetUser.isBanned
                    ? 'Confirm Unban'
                    : 'Confirm Account Ban'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGate>
  );
};

export default AdminUsers;
