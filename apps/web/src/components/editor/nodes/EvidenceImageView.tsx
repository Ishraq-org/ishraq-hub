import React from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Icon } from '../../icons';

export const EvidenceImageView: React.FC<NodeViewProps> = (props) => {
  const { primaryImage, secondaryImage, caption, citation } = props.node.attrs;

  const hasSecondary = Boolean(secondaryImage && secondaryImage.url);

  return (
    <NodeViewWrapper className="my-6">
      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-md space-y-3">
        {/* Header Badge */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
          <div className="flex items-center gap-1.5">
            <Icon name="evidence" size={14} />
            <span>Photographic Source Evidence</span>
          </div>
        </div>

        {/* Image Grid: Side-by-Side when dual images exist per Prompt 09 §98 */}
        <div className={`grid gap-3 ${hasSecondary ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          <div className="rounded-lg overflow-hidden border border-[var(--border)] bg-black/5">
            <img
              src={primaryImage?.url}
              alt={primaryImage?.alt || 'Primary evidence source page'}
              className="w-full h-auto object-cover max-h-[350px] mx-auto"
            />
            <div className="p-1.5 text-[10px] text-center text-[var(--text-muted)] border-t border-[var(--border)] font-mono">
              Primary Plate / Page
            </div>
          </div>

          {hasSecondary && (
            <div className="rounded-lg overflow-hidden border border-[var(--border)] bg-black/5">
              <img
                src={secondaryImage?.url}
                alt={secondaryImage?.alt || 'Secondary evidence volume cover'}
                className="w-full h-auto object-cover max-h-[350px] mx-auto"
              />
              <div className="p-1.5 text-[10px] text-center text-[var(--text-muted)] border-t border-[var(--border)] font-mono">
                Volume / Cover Plate
              </div>
            </div>
          )}
        </div>

        {/* Caption */}
        {caption && (
          <p className="text-xs text-[var(--text-primary)] font-semibold text-center leading-snug pt-1">
            {caption}
          </p>
        )}

        {/* Structured Citation per Prompt 09 §99 */}
        {citation && (
          <div className="pt-2 border-t border-[var(--border)] text-[10px] text-[var(--text-muted)] space-y-0.5">
            <p className="font-semibold text-[var(--text-secondary)]">
              Citation: {citation.title} ({citation.year})
            </p>
            <p>
              Author: {citation.author || 'N/A'} • Publisher: {citation.publisher || 'N/A'}{' '}
              {citation.page ? `• Page: ${citation.page}` : ''}
            </p>
            {citation.url && (
              <a
                href={citation.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[var(--accent)] underline hover:opacity-80 pt-0.5"
              >
                <span>Verify Source URL</span>
                <Icon name="external-link" size={10} />
              </a>
            )}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default EvidenceImageView;
