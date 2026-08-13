import React from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Icon } from '../../icons';

export const HadithView: React.FC<NodeViewProps> = (props) => {
  const { text, narrator, source, grade } = props.node.attrs;

  const getGradeBadgeStyle = (gradeStr: string) => {
    const g = (gradeStr || '').toLowerCase();
    if (g.includes('sahih')) {
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
    }
    if (g.includes('hasan')) {
      return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
    }
    if (g.includes('da') || g.includes('weak') || g.includes('mawdu')) {
      return 'bg-rose-500/10 text-rose-600 border-rose-500/30';
    }
    return 'bg-zinc-500/10 text-zinc-600 border-zinc-500/30';
  };

  return (
    <NodeViewWrapper className="my-6">
      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-sm space-y-3 text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
          <div className="flex items-center gap-2 text-[var(--accent)] font-bold text-xs">
            <Icon name="hadith" size={18} />
            <span>Prophetic Tradition (Hadith)</span>
          </div>
          {/* Prominent Grade Badge per Prompt 09 §76 */}
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getGradeBadgeStyle(
              grade
            )}`}
          >
            Grade: {grade || 'Authentic'}
          </span>
        </div>

        {/* Narrator */}
        {narrator && (
          <p className="text-[11px] font-semibold text-[var(--text-muted)] italic">
            On the authority of {narrator}:
          </p>
        )}

        {/* Hadith Text */}
        <p className="text-xs text-[var(--text-primary)] font-serif leading-relaxed italic border-l-2 border-[var(--accent)] pl-3">
          "{text}"
        </p>

        {/* Source Citation */}
        <div className="pt-2 border-t border-[var(--border)] text-[10px] font-semibold text-[var(--text-muted)] flex items-center justify-between">
          <span>Source: {source || 'Sahih al-Bukhari'}</span>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export default HadithView;
