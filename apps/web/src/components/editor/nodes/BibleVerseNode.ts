import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import BibleView from './BibleView';

export const BibleVerseNode = Node.create({
  name: 'bibleVerse',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      book: { default: 'Genesis' },
      chapter: { default: 1 },
      verse: { default: '1' },
      translationVersion: { default: 'KJV' },
      text: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="bible-verse"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'bible-verse' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BibleView);
  },
});

export default BibleVerseNode;
