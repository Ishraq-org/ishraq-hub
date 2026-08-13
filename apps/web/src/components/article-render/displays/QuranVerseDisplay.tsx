import React from 'react';
import { Icon } from '../../icons';

export interface QuranVerseDisplayProps {
  surah: number;
  ayah: number;
  arabicText: string;
  translation: string;
  translationSource?: string;
  children?: React.ReactNode;
}

export const QuranVerseDisplay: React.FC<QuranVerseDisplayProps> = ({
  surah,
  ayah,
  arabicText,
  translation,
  translationSource = 'Sahih International',
  children,
}) => {
  return (
    <div className="my-6 border-l-4 border-[var(--accent)] bg-[var(--bg-secondary)] rounded-r-lg p-5 shadow-sm space-y-4 text-left">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 text-xs font-bold text-[var(--accent)]">
        <div className="flex items-center gap-2">
          <Icon name="quran" size={16} />
          <span>Surah {surah}, Ayah {ayah}</span>
        </div>
        {children}
      </div>

      {/* Arabic Uthmani Text — Scoped dir="rtl" per Prompt 11 §100-107 */}
      <div
        dir="rtl"
        className="font-arabic text-xl sm:text-2xl leading-loose text-right text-[var(--text-primary)] py-2 font-bold tracking-wide"
      >
        {arabicText || '...'}
      </div>

      {/* Translation & Source */}
      <div className="border-t border-[var(--border)] pt-3 text-xs text-[var(--text-muted)] space-y-1">
        <p className="italic text-sm text-[var(--text-primary)] leading-relaxed">
          "{translation || '...'}"
        </p>
        <p className="text-[10px] text-right font-medium">— Translation: {translationSource}</p>
      </div>
    </div>
  );
};

export default QuranVerseDisplay;
