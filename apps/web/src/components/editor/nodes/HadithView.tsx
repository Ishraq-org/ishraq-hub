import React from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { HadithDisplay } from '../../article-render/displays/HadithDisplay';

export const HadithView: React.FC<NodeViewProps> = (props) => {
  const { text, narrator, source, grade } = props.node.attrs;

  return (
    <NodeViewWrapper className="hadith-node-wrapper">
      <HadithDisplay
        text={text}
        narrator={narrator}
        source={source}
        grade={grade}
      >
        <span className="text-[10px] text-[var(--text-muted)] font-normal italic">
          [Editor View - Hadith Block]
        </span>
      </HadithDisplay>
    </NodeViewWrapper>
  );
};

export default HadithView;
