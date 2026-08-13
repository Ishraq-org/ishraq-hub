import React from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Icon } from '../../icons';

export const BibleView: React.FC<NodeViewProps> = (props) => {
  const { book, chapter, verse, translationVersion, text } = props.node.attrs;

  return (
    <NodeViewWrapper className="my-6">
      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-sm space-y-3 text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
          <div className="flex items-center gap-2 text-[var(--accent)] font-bold text-xs">
            <Icon name="cross" size={16} />
            <span>
              {book} {chapter}:{verse} ({translationVersion})
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] bg-[var(--bg-primary)] px-2 py-0.5 rounded border border-[var(--border)]">
            Biblical Citation
          </span>
        </div>

        {/* Verse Text */}
        <p className="text-xs text-[var(--text-primary)] font-serif leading-relaxed italic">
          "{text}"
        </p>

        {/* Version attribution */}
        <div className="pt-2 border-t border-[var(--border)] text-[10px] font-semibold text-[var(--text-muted)]">
          <span>Translation: {translationVersion}</span>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export default BibleView;
