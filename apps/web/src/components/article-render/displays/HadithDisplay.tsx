import React from 'react';
import { Icon } from '../../icons';

export interface HadithDisplayProps {
  text: string;
  narrator: string;
  source: string;
  grade: 'sahih' | 'hasan' | 'daif';
  children?: React.ReactNode;
}

export const HadithDisplay: React.FC<HadithDisplayProps> = ({
  text,
  narrator,
  source,
  grade = 'sahih',
  children,
}) => {
  const gradeStyles = {
    sahih: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60',
    hasan: 'bg-amber-950/40 text-amber-400 border-amber-800/60',
    daif: 'bg-rose-950/40 text-rose-400 border-rose-800/60',
  };

  const gradeLabels = {
    sahih: 'Sahih (Authentic)',
    hasan: 'Hasan (Good)',
    daif: "Da'if (Weak)",
  };

  return (
    <div className="my-6 border border-[var(--border)] bg-[var(--bg-secondary)] rounded-xl p-5 shadow-sm space-y-4 text-left relative overflow-hidden">
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--accent)]" />

      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 text-xs font-bold text-[var(--accent)] pt-1">
        <div className="flex items-center gap-2">
          <Icon name="hadith" size={16} />
          <span>Prophetic Tradition</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
              gradeStyles[grade] || gradeStyles.sahih
            }`}
          >
            {gradeLabels[grade] || 'Sahih'}
          </span>
          {children}
        </div>
      </div>

      <blockquote className="italic text-sm text-[var(--text-primary)] leading-relaxed pl-3 border-l-2 border-[var(--accent)]">
        "{text || '...'}"
      </blockquote>

      <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] border-t border-[var(--border)] pt-2 font-medium">
        <span>Narrator: {narrator || 'Unspecified'}</span>
        <span>Source: {source || 'Unspecified'}</span>
      </div>
    </div>
  );
};

export default HadithDisplay;
