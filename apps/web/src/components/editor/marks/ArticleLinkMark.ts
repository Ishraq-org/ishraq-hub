import { Mark, mergeAttributes } from '@tiptap/core';

export interface ArticleLinkMarkOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    articleLink: {
      setArticleLink: (attributes: { targetArticleId: string; href?: string }) => ReturnType;
      unsetArticleLink: () => ReturnType;
    };
  }
}

export const ArticleLinkMark = Mark.create<ArticleLinkMarkOptions>({
  name: 'link',

  keepOnSplit: false,

  addOptions() {
    return {
      HTMLAttributes: {
        class:
          'article-internal-link inline border-b border-dotted border-[var(--accent)] text-[var(--accent)] font-semibold hover:opacity-80 transition-opacity cursor-pointer',
      },
    };
  },

  addAttributes() {
    return {
      href: {
        default: null,
      },
      targetArticleId: {
        default: null,
      },
      target: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [{ tag: 'a[href]' }, { tag: 'a[data-target-id]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'a',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'article-link',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setArticleLink:
        (attributes) =>
        ({ chain }) => {
          return chain().setMark(this.name, attributes).run();
        },
      unsetArticleLink:
        () =>
        ({ chain }) => {
          return chain().unsetMark(this.name).run();
        },
    };
  },
});

export default ArticleLinkMark;
