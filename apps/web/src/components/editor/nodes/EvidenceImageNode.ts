import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import EvidenceImageView from './EvidenceImageView';

export const EvidenceImageNode = Node.create({
  name: 'evidenceImage',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      primaryImage: { default: { url: '', alt: '' } },
      secondaryImage: { default: null },
      caption: { default: '' },
      citation: {
        default: {
          sourceType: 'book',
          title: '',
          author: '',
          publisher: '',
          year: new Date().getFullYear(),
          page: null,
          url: '',
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="evidence-image"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'evidence-image' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EvidenceImageView);
  },
});

export default EvidenceImageNode;
