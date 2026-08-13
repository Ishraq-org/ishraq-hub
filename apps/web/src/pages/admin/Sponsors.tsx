import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoleGate } from '../../components/RoleGate';
import { Icon } from '../../components/icons';
import { ImageUploadField } from '../../components/ImageUploadField';

interface SponsorItem {
  _id: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string | null;
  tier: 'partner' | 'sponsor' | 'contributor';
  createdAt: string;
}

export const AdminSponsors: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedSponsor, setSelectedSponsor] = useState<SponsorItem | null>(null);
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [tier, setTier] = useState<'partner' | 'sponsor' | 'contributor'>('sponsor');

  const { data, isLoading } = useQuery({
    queryKey: ['adminSponsors'],
    queryFn: async () => {
      const res = await fetch('/api/sponsors');
      if (!res.ok) throw new Error('Failed to load sponsors');
      return res.json();
    },
  });

  const createOrUpdateMutation = useMutation({
    mutationFn: async () => {
      if (!name || !logoUrl) {
        throw new Error('Sponsor name and logo image are required');
      }

      const payload = { name, logoUrl, websiteUrl: websiteUrl || null, tier };
      const url = selectedSponsor ? `/api/sponsors/${selectedSponsor._id}` : '/api/sponsors';
      const method = selectedSponsor ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Operation failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSponsors'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sponsors/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to delete sponsor');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSponsors'] });
    },
  });

  const resetForm = () => {
    setSelectedSponsor(null);
    setName('');
    setLogoUrl(null);
    setWebsiteUrl('');
    setTier('sponsor');
  };

  const handleEdit = (item: SponsorItem) => {
    setSelectedSponsor(item);
    setName(item.name);
    setLogoUrl(item.logoUrl);
    setWebsiteUrl(item.websiteUrl || '');
    setTier(item.tier);
  };

  return (
    <RoleGate allowedRoles={['super_admin']}>
      <div className="max-w-6xl mx-auto p-6 space-y-6 text-xs text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
              Partner & Sponsor Management
            </span>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Homepage Sponsors & Partners</h1>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="px-3.5 py-2 rounded-lg bg-[var(--accent)] text-[var(--bg-secondary)] font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
          >
            <Icon name="plus" size={14} />
            <span>Add New Sponsor</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sponsors List Table */}
          <div className="lg:col-span-2 p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[var(--accent)] border-b border-[var(--border)] pb-3 flex items-center gap-2">
              <Icon name="user" size={16} />
              <span>Current Sponsors & Partners</span>
            </h2>

            {isLoading ? (
              <div className="p-6 text-center text-[var(--text-muted)] italic">Loading sponsors...</div>
            ) : data?.sponsors?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[10px] uppercase font-bold text-[var(--accent)]">
                      <th className="py-2.5 px-3">Logo</th>
                      <th className="py-2.5 px-3">Name & Website</th>
                      <th className="py-2.5 px-3">Tier</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {data.sponsors.map((s: SponsorItem) => (
                      <tr key={s._id} className="hover:bg-[var(--bg-primary)]/50 transition-colors">
                        <td className="py-3 px-3">
                          <img
                            src={s.logoUrl}
                            alt={s.name}
                            className="w-10 h-10 object-contain rounded border border-[var(--border)] bg-black/30 p-1"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-[var(--text-primary)]">{s.name}</p>
                          {s.websiteUrl ? (
                            <a
                              href={s.websiteUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-[var(--accent)] hover:underline font-mono"
                            >
                              {s.websiteUrl}
                            </a>
                          ) : (
                            <span className="text-[10px] text-[var(--text-muted)]">No URL</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                              s.tier === 'partner'
                                ? 'bg-amber-950/50 text-amber-400 border-amber-800/60'
                                : s.tier === 'sponsor'
                                ? 'bg-sky-950/50 text-sky-400 border-sky-800/60'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {s.tier}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(s)}
                            className="px-2 py-1 rounded border border-[var(--border)] hover:bg-[var(--bg-primary)] text-[11px]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteMutation.mutate(s._id)}
                            className="px-2 py-1 rounded border border-rose-900/50 text-rose-400 bg-rose-950/20 hover:bg-rose-950/40 text-[11px]"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-[var(--text-muted)] italic">No sponsors configured yet.</div>
            )}
          </div>

          {/* Create/Edit Form Panel */}
          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] space-y-4 shadow-sm h-fit">
            <h2 className="text-sm font-bold text-[var(--accent)] border-b border-[var(--border)] pb-3">
              {selectedSponsor ? `Edit Sponsor: ${selectedSponsor.name}` : 'Add New Sponsor'}
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createOrUpdateMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block font-semibold mb-1">Organization / Sponsor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Furqan Foundation"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                />
              </div>

              <div>
                <ImageUploadField
                  label="Sponsor Logo (Cloudinary Direct)"
                  folder="covers"
                  value={logoUrl}
                  onChange={setLogoUrl}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Website URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Sponsor Tier</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none font-bold text-xs"
                >
                  <option value="partner">Partner (Top Tier)</option>
                  <option value="sponsor">Sponsor (Mid Tier)</option>
                  <option value="contributor">Contributor (Supporter)</option>
                </select>
              </div>

              {createOrUpdateMutation.isError && (
                <div className="p-2 rounded bg-rose-950/40 border border-rose-800/60 text-rose-300 text-[11px]">
                  {(createOrUpdateMutation.error as Error).message}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={createOrUpdateMutation.isPending}
                  className="flex-1 py-2 rounded bg-[var(--accent)] text-[var(--bg-secondary)] font-bold hover:opacity-90 transition-opacity"
                >
                  {createOrUpdateMutation.isPending ? 'Saving...' : selectedSponsor ? 'Update Sponsor' : 'Add Sponsor'}
                </button>
                {selectedSponsor && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--bg-primary)]"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </RoleGate>
  );
};

export default AdminSponsors;
