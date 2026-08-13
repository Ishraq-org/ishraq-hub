import React from 'react';
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react';
import { CalloutDisplay } from '../../article-render/displays/CalloutDisplay';

export const CalloutView: React.FC<NodeViewProps> = (props) => {
  const { variant } = props.node.attrs;

  return (
    <NodeViewWrapper className="callout-node-wrapper">
      <CalloutDisplay
        variant={variant}
        headerControls={
          <span className="text-[10px] text-[var(--text-muted)] font-normal italic">
            [Editor View - Callout Container]
          </span>
        }
      >
        <NodeViewContent className="outline-none min-h-[1.5em]" />
      </CalloutDisplay>
    </NodeViewWrapper>
  );
};

export default CalloutView;
