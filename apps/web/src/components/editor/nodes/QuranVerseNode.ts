import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import QuranVerseView from './QuranVerseView';

export const QuranVerseNode = Node.create({
  name: 'quranVerse',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      surah: { default: 1 },
      ayah: { default: 1 },
      arabicText: { default: '' },
      translation: { default: '' },
      translationSource: { default: 'Sahih International' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="quran-verse"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'quran-verse' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(QuranVerseView);
  },
});

export default QuranVerseNode;
