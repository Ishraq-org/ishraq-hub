import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import HadithView from './HadithView';

export const HadithNode = Node.create({
  name: 'hadith',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      text: { default: '' },
      narrator: { default: '' },
      source: { default: '' },
      grade: { default: 'Sahih' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="hadith"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'hadith' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(HadithView);
  },
});

export default HadithNode;
