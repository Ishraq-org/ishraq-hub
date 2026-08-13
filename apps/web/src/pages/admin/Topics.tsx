import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoleGate } from '../../components/RoleGate';
import { Icon } from '../../components/icons';

interface TopicNode {
  _id: string;
  name: { en: string; am: string };
  slug: { en: string; am: string };
  parentTopicId?: string | null;
  description?: { en: string; am: string } | null;
  children?: TopicNode[];
}

export const AdminTopics: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedTopic, setSelectedTopic] = useState<TopicNode | null>(null);
  const [mergeSource, setMergeSource] = useState<TopicNode | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState<string>('');
  const [nameEn, setNameEn] = useState('');
  const [nameAm, setNameAm] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descAm, setDescAm] = useState('');
  const [parentId, setParentId] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminTopics'],
    queryFn: async () => {
      const res = await fetch('/api/topics');
      if (!res.ok) throw new Error('Failed to load topics');
      return res.json();
    },
  });

  const createOrUpdateMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: { en: nameEn, am: nameAm },
        description: { en: descEn, am: descAm },
        parentTopicId: parentId || null,
      };

      const url = selectedTopic ? `/api/topics/${selectedTopic._id}` : '/api/topics';
      const method = selectedTopic ? 'PATCH' : 'POST';

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
      queryClient.invalidateQueries({ queryKey: ['adminTopics'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/topics/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to delete topic');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTopics'] });
    },
  });

  const mergeMutation = useMutation({
    mutationFn: async () => {
      if (!mergeSource || !mergeTargetId) return;
      const res = await fetch(`/api/topics/${mergeSource._id}/merge-into/${mergeTargetId}`, {
        method: 'POST',
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to merge topics');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTopics'] });
      setMergeSource(null);
      setMergeTargetId('');
    },
  });

  const resetForm = () => {
    setSelectedTopic(null);
    setNameEn('');
    setNameAm('');
    setDescEn('');
    setDescAm('');
    setParentId('');
  };

  const handleEdit = (t: TopicNode) => {
    setSelectedTopic(t);
    setNameEn(t.name.en);
    setNameAm(t.name.am);
    setDescEn(t.description?.en || '');
    setDescAm(t.description?.am || '');
    setParentId(t.parentTopicId || '');
  };

  const rootTopics: TopicNode[] = data?.topics || [];
  const flatTopics: TopicNode[] = data?.flatTopics || [];

  return (
    <RoleGate allowedRoles={['super_admin']}>
      <div className="max-w-6xl mx-auto p-6 space-y-8 text-xs text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
              Taxonomy Management
            </span>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Topics & Taxonomy</h1>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="px-3.5 py-2 rounded-lg bg-[var(--accent)] text-[var(--bg-secondary)] font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
          >
            <Icon name="plus" size={14} />
            <span>Create New Root Topic</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Topic Tree View (Prompt 12 §81-86) */}
          <div className="lg:col-span-2 p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-[var(--accent)] flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <Icon name="folder" size={16} />
              <span>Topic Hierarchy Tree</span>
            </h2>

            {isLoading ? (
              <div className="p-6 text-center text-[var(--text-muted)] italic">Loading topic tree...</div>
            ) : rootTopics.length > 0 ? (
              <div className="space-y-2">
                {rootTopics.map((node) => (
                  <TopicTreeNode
                    key={node._id}
                    node={node}
                    onEdit={handleEdit}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    onMerge={(t) => setMergeSource(t)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-[var(--text-muted)] italic">No topics defined yet.</div>
            )}
          </div>

          {/* Form Panel */}
          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] space-y-4 shadow-sm h-fit">
            <h2 className="text-sm font-bold text-[var(--accent)] border-b border-[var(--border)] pb-3">
              {selectedTopic ? `Edit Topic: ${selectedTopic.name.en}` : 'Create New Topic'}
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createOrUpdateMutation.mutate();
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-semibold mb-1">English Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manuscript Evidence"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Amharic Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. የቅዱሳት ጽሁፎች ማስረጃ"
                  value={nameAm}
                  onChange={(e) => setNameAm(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Parent Topic (Optional)</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                >
                  <option value="">None (Top-Level Root Topic)</option>
                  {flatTopics
                    .filter((t) => !selectedTopic || t._id !== selectedTopic._id)
                    .map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name.en} / {t.name.am}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">English Description</label>
                <textarea
                  rows={2}
                  placeholder="Category overview..."
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Amharic Description</label>
                <textarea
                  rows={2}
                  placeholder="የምድቡ ማብራሪያ..."
                  value={descAm}
                  onChange={(e) => setDescAm(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                />
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
                  {createOrUpdateMutation.isPending ? 'Saving...' : selectedTopic ? 'Update Topic' : 'Create Topic'}
                </button>
                {selectedTopic && (
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

        {/* Custom Confirmation Modal for Atomic Topic Merge (Prompt 12 §86-92) */}
        {mergeSource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="max-w-md w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5 shadow-2xl space-y-4 text-xs text-[var(--text-primary)]">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
                  <Icon name="warning" size={18} />
                  <span>Atomic Topic Merge Confirmation</span>
                </div>
                <button type="button" onClick={() => setMergeSource(null)} className="p-1 rounded hover:bg-[var(--bg-primary)]">
                  <Icon name="close" size={16} />
                </button>
              </div>

              <p className="leading-relaxed">
                You are about to merge <strong className="text-[var(--accent)]">{mergeSource.name.en}</strong> into another topic. All referencing articles and child topics will be atomically reassigned to the target topic, and <strong>{mergeSource.name.en}</strong> will be permanently deleted.
              </p>

              <div>
                <label className="block font-semibold mb-1">Select Target Topic to Merge Into</label>
                <select
                  value={mergeTargetId}
                  onChange={(e) => setMergeTargetId(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none font-bold"
                >
                  <option value="">-- Choose Target Topic --</option>
                  {flatTopics
                    .filter((t) => t._id !== mergeSource._id)
                    .map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name.en} ({t.name.am})
                      </option>
                    ))}
                </select>
              </div>

              {mergeMutation.isError && (
                <div className="p-2 rounded bg-rose-950/40 border border-rose-800/60 text-rose-300 text-[11px]">
                  {(mergeMutation.error as Error).message}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMergeSource(null)}
                  className="px-4 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--bg-primary)] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!mergeTargetId || mergeMutation.isPending}
                  onClick={() => mergeMutation.mutate()}
                  className="px-4 py-1.5 rounded bg-amber-600 text-white font-bold hover:bg-amber-700 disabled:opacity-50 transition-colors"
                >
                  {mergeMutation.isPending ? 'Merging...' : 'Confirm Atomic Merge'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGate>
  );
};

interface TopicTreeNodeProps {
  node: TopicNode;
  onEdit: (t: TopicNode) => void;
  onDelete: (id: string) => void;
  onMerge: (t: TopicNode) => void;
}

const TopicTreeNode: React.FC<TopicTreeNodeProps> = ({ node, onEdit, onDelete, onMerge }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="space-y-1">
      <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] flex items-center justify-between hover:border-[var(--accent)]/50 transition-colors">
        <div className="flex items-center gap-2">
          {node.children && node.children.length > 0 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <Icon name={isExpanded ? 'chevron-down' : 'chevron-right'} size={14} />
            </button>
          )}
          <div>
            <p className="font-bold text-[var(--text-primary)]">
              {node.name.en} <span className="text-[var(--text-muted)]">({node.name.am})</span>
            </p>
            <p className="text-[10px] text-[var(--text-muted)] font-mono">
              /en/topics/{node.slug.en} • /am/topics/{node.slug.am}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(node)}
            className="px-2 py-1 rounded border border-[var(--border)] hover:bg-[var(--bg-secondary)] text-[11px]"
            title="Edit Topic"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onMerge(node)}
            className="px-2 py-1 rounded border border-amber-800/50 text-amber-400 bg-amber-950/20 hover:bg-amber-950/40 text-[11px]"
            title="Merge into another topic"
          >
            Merge
          </button>

          {/* Delete Button with Safety Check Tooltip */}
          <button
            type="button"
            onClick={() => onDelete(node._id)}
            className="px-2 py-1 rounded border border-rose-900/50 text-rose-400 bg-rose-950/20 hover:bg-rose-950/40 text-[11px]"
            title="Delete topic (will fail if articles or sub-topics reference it)"
          >
            Delete
          </button>
        </div>
      </div>

      {isExpanded && node.children && node.children.length > 0 && (
        <div className="pl-6 space-y-1 border-l-2 border-[var(--border)] ml-3">
          {node.children.map((child) => (
            <TopicTreeNode
              key={child._id}
              node={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onMerge={onMerge}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTopics;
