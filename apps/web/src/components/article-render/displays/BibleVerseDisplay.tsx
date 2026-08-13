import React from 'react';
import { Icon } from '../../icons';

export interface BibleVerseDisplayProps {
  book: string;
  chapter: number;
  verse: string;
  translationVersion: string;
  text: string;
  children?: React.ReactNode;
}

export const BibleVerseDisplay: React.FC<BibleVerseDisplayProps> = ({
  book,
  chapter,
  verse,
  translationVersion,
  text,
  children,
}) => {
  return (
    <div className="my-6 border-l-4 border-slate-500 bg-[var(--bg-secondary)] rounded-r-lg p-5 shadow-sm space-y-3 text-left">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 text-xs font-bold text-slate-300">
        <div className="flex items-center gap-2">
          <Icon name="cross" size={16} />
          <span>
            {book} {chapter}:{verse} ({translationVersion.toUpperCase()})
          </span>
        </div>
        {children}
      </div>

      <p className="italic text-sm text-[var(--text-primary)] leading-relaxed">
        "{text || '...'}"
      </p>
    </div>
  );
};

export default BibleVerseDisplay;
