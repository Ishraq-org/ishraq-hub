import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import FootnoteView from './FootnoteView';

export const FootnoteNode = Node.create({
  name: 'footnote',
  inline: true,
  group: 'inline',
  atom: true,

  addAttributes() {
    return {
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
        tag: 'span[data-type="footnote"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'footnote' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FootnoteView);
  },
});

export default FootnoteNode;
