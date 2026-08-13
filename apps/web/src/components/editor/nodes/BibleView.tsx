import React from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { BibleVerseDisplay } from '../../article-render/displays/BibleVerseDisplay';

export const BibleView: React.FC<NodeViewProps> = (props) => {
  const { book, chapter, verse, translationVersion, text } = props.node.attrs;

  return (
    <NodeViewWrapper className="bible-verse-node-wrapper">
      <BibleVerseDisplay
        book={book}
        chapter={chapter}
        verse={verse}
        translationVersion={translationVersion}
        text={text}
      >
        <span className="text-[10px] text-[var(--text-muted)] font-normal italic">
          [Editor View - Bible Block]
        </span>
      </BibleVerseDisplay>
    </NodeViewWrapper>
  );
};

export default BibleView;
