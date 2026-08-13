import React from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { QuranVerseDisplay } from '../../article-render/displays/QuranVerseDisplay';

export const QuranVerseView: React.FC<NodeViewProps> = (props) => {
  const { surah, ayah, arabicText, translation, translationSource } = props.node.attrs;

  return (
    <NodeViewWrapper className="quran-verse-node-wrapper">
      <QuranVerseDisplay
        surah={surah}
        ayah={ayah}
        arabicText={arabicText}
        translation={translation}
        translationSource={translationSource}
      >
        <span className="text-[10px] text-[var(--text-muted)] font-normal italic">
          [Editor View - Quran Block]
        </span>
      </QuranVerseDisplay>
    </NodeViewWrapper>
  );
};

export default QuranVerseView;
