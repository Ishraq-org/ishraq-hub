import React from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Icon } from '../../icons';

export const QuranVerseView: React.FC<NodeViewProps> = (props) => {
  const { surah, ayah, arabicText, translation, translationSource } = props.node.attrs;

  return (
    <NodeViewWrapper className="my-6">
      <div className="p-5 rounded-xl border border-[var(--accent)]/40 bg-[var(--bg-secondary)] shadow-sm space-y-4 text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
          <div className="flex items-center gap-2 text-[var(--accent)] font-bold text-xs">
            <Icon name="quran" size={18} />
            <span>
              Surah {surah}, Ayah {ayah}
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] bg-[var(--bg-primary)] px-2 py-0.5 rounded border border-[var(--border)]">
            Holy Qur'an
          </span>
        </div>

        {/* Arabic Text (Scoped RTL & Font) */}
        <div
          dir="rtl"
          lang="ar"
          className="text-right text-xl sm:text-2xl font-serif text-[var(--text-primary)] leading-loose pt-1 font-arabic"
          style={{ fontFamily: "var(--font-arabic, 'Amiri', 'Noto Naskh Arabic', serif)" }}
        >
          {arabicText || '...'}
        </div>

        {/* Translation & Source */}
        <div className="pt-2 border-t border-[var(--border)] space-y-1">
          <p className="text-xs text-[var(--text-primary)] italic leading-relaxed">
            "{translation}"
          </p>
          <p className="text-[10px] font-semibold text-[var(--text-muted)]">
            — Translation: {translationSource || 'Sahih International'}
          </p>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export default QuranVerseView;
