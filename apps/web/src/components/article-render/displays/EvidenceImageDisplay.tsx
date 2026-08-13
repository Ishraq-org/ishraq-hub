import React from 'react';
import { Icon } from '../../icons';

export interface EvidenceImageDisplayProps {
  primaryImage: { url: string; alt?: string };
  secondaryImage?: { url: string; alt?: string };
  caption?: string;
  citation?: {
    bookTitle?: string;
    author?: string;
    volumePage?: string;
  };
  children?: React.ReactNode;
}

export const EvidenceImageDisplay: React.FC<EvidenceImageDisplayProps> = ({
  primaryImage,
  secondaryImage,
  caption,
  citation,
  children,
}) => {
  const hasSecondary = Boolean(secondaryImage?.url);

  return (
    <div className="my-6 border border-[var(--border)] bg-[var(--bg-secondary)] rounded-xl p-4 shadow-sm space-y-3 text-left">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 text-xs font-bold text-[var(--accent)]">
        <div className="flex items-center gap-2">
          <Icon name="evidence" size={16} />
          <span>Evidence Plate Archive</span>
        </div>
        {children}
      </div>

      {/* Dual Plate Grid */}
      <div className={`grid gap-4 ${hasSecondary ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {primaryImage?.url && (
          <div className="space-y-1">
            <img
              src={primaryImage.url}
              alt={primaryImage.alt || 'Primary evidence plate'}
              className="w-full h-auto rounded-lg border border-[var(--border)] object-cover shadow-sm"
            />
            <p className="text-[10px] text-[var(--text-muted)] text-center font-medium">
              Primary Evidence Plate
            </p>
          </div>
        )}

        {hasSecondary && (
          <div className="space-y-1">
            <img
              src={secondaryImage!.url}
              alt={secondaryImage!.alt || 'Volume cover plate'}
              className="w-full h-auto rounded-lg border border-[var(--border)] object-cover shadow-sm"
            />
            <p className="text-[10px] text-[var(--text-muted)] text-center font-medium">
              Volume Cover / Context Plate
            </p>
          </div>
        )}
      </div>

      {/* Caption & Citation */}
      {(caption || citation) && (
        <div className="border-t border-[var(--border)] pt-2 text-xs space-y-1 text-[var(--text-primary)]">
          {caption && <p className="font-semibold text-center">{caption}</p>}
          {citation && (
            <p className="text-[10px] text-[var(--text-muted)] text-center italic">
              Citation: {citation.bookTitle || ''} {citation.author ? `by ${citation.author}` : ''}{' '}
              {citation.volumePage ? `(${citation.volumePage})` : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default EvidenceImageDisplay;
