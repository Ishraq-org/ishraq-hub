import React from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { HoverPopover } from '../../common/HoverPopover';
import { Icon } from '../../icons';

export const FootnoteView: React.FC<NodeViewProps> = (props) => {
  const { citation } = props.node.attrs;

  // Compute footnote index dynamically at render time by scanning document nodes up to this pos per Prompt 09 §121
  let index = 1;
  if (props.editor && props.getPos) {
    try {
      const pos = props.getPos();
      let count = 0;
      props.editor.state.doc.descendants((node, nodePos) => {
        if (node.type.name === 'footnote') {
          count++;
          if (nodePos === pos) {
            index = count;
            return false;
          }
        }
      });
    } catch (e) {
      index = 1;
    }
  }

  const trigger = (
    <sup className="inline-flex items-center justify-center px-1.5 py-0.5 mx-0.5 rounded bg-[var(--accent)]/15 text-[var(--accent)] font-bold text-[10px] hover:bg-[var(--accent)] hover:text-[var(--bg-secondary)] transition-colors cursor-pointer select-none">
      [{index}]
    </sup>
  );

  const popoverContent = (
    <div className="space-y-1 text-[11px] text-left">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-1 mb-1 font-bold text-[var(--accent)]">
        <span>Footnote [{index}]</span>
        <span className="uppercase text-[9px] text-[var(--text-muted)] font-mono">
          {citation?.sourceType || 'Citation'}
        </span>
      </div>
      <p className="font-semibold text-[var(--text-primary)] leading-tight">
        {citation?.title || 'Untitled Source'}
      </p>
      <p className="text-[10px] text-[var(--text-muted)]">
        Author: {citation?.author || 'N/A'} • Publisher: {citation?.publisher || 'N/A'}{' '}
        {citation?.year ? `(${citation.year})` : ''}
      </p>
      {citation?.page && <p className="text-[10px] text-[var(--text-muted)]">Page: {citation.page}</p>}
      {citation?.url && (
        <a
          href={citation.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[var(--accent)] text-[10px] underline hover:opacity-80 pt-1"
        >
          <span>Open Link</span>
          <Icon name="external-link" size={10} />
        </a>
      )}
    </div>
  );

  return (
    <NodeViewWrapper as="span" className="inline">
      <HoverPopover trigger={trigger} content={popoverContent} />
    </NodeViewWrapper>
  );
};

export default FootnoteView;
