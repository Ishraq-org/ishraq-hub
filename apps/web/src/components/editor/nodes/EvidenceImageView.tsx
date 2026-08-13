import React from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { EvidenceImageDisplay } from '../../article-render/displays/EvidenceImageDisplay';

export const EvidenceImageView: React.FC<NodeViewProps> = (props) => {
  const { primaryImage, secondaryImage, caption, citation } = props.node.attrs;

  return (
    <NodeViewWrapper className="evidence-image-node-wrapper">
      <EvidenceImageDisplay
        primaryImage={primaryImage}
        secondaryImage={secondaryImage}
        caption={caption}
        citation={citation}
      >
        <span className="text-[10px] text-[var(--text-muted)] font-normal italic">
          [Editor View - Evidence Plate]
        </span>
      </EvidenceImageDisplay>
    </NodeViewWrapper>
  );
};

export default EvidenceImageView;
