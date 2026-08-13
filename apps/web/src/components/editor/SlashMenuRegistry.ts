import { Editor } from '@tiptap/react';

export interface SlashCommandItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'standard' | 'custom' | 'media';
  command: (editor: Editor) => void;
}

class SlashMenuRegistryClass {
  private items: SlashCommandItem[] = [];

  constructor() {
    this.registerStandardCommands();
    this.registerCustomNodeCommands();
  }

  private registerStandardCommands() {
    this.register({
      id: 'paragraph',
      title: 'Paragraph',
      description: 'Standard text block',
      icon: 'type',
      category: 'standard',
      command: (editor) => editor.chain().focus().setParagraph().run(),
    });

    this.register({
      id: 'heading1',
      title: 'Heading 1',
      description: 'Top-level section heading',
      icon: 'heading-1',
      category: 'standard',
      command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    });

    this.register({
      id: 'heading2',
      title: 'Heading 2',
      description: 'Sub-section heading',
      icon: 'heading-2',
      category: 'standard',
      command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    });

    this.register({
      id: 'heading3',
      title: 'Heading 3',
      description: 'Minor section heading',
      icon: 'heading-3',
      category: 'standard',
      command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    });

    this.register({
      id: 'bulletList',
      title: 'Bullet List',
      description: 'Simple bulleted list',
      icon: 'list-bullet',
      category: 'standard',
      command: (editor) => editor.chain().focus().toggleBulletList().run(),
    });

    this.register({
      id: 'orderedList',
      title: 'Numbered List',
      description: 'Numbered sequential list',
      icon: 'list-ordered',
      category: 'standard',
      command: (editor) => editor.chain().focus().toggleOrderedList().run(),
    });

    this.register({
      id: 'blockquote',
      title: 'Quote',
      description: 'Blockquote callout text',
      icon: 'quote',
      category: 'standard',
      command: (editor) => editor.chain().focus().toggleBlockquote().run(),
    });

    this.register({
      id: 'table',
      title: 'Table',
      description: 'Insert a 3x3 table grid',
      icon: 'table',
      category: 'standard',
      command: (editor) =>
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    });
  }

  private registerCustomNodeCommands() {
    this.register({
      id: 'quranVerse',
      title: 'Quran Verse',
      description: 'Arabic Uthmani text with translation',
      icon: 'quran',
      category: 'custom',
      command: () => {
        window.dispatchEvent(new CustomEvent('open-node-modal', { detail: { nodeType: 'quranVerse' } }));
      },
    });

    this.register({
      id: 'hadith',
      title: 'Hadith Narration',
      description: 'Prophetic tradition with grade badge',
      icon: 'hadith',
      category: 'custom',
      command: () => {
        window.dispatchEvent(new CustomEvent('open-node-modal', { detail: { nodeType: 'hadith' } }));
      },
    });

    this.register({
      id: 'bibleVerse',
      title: 'Bible Verse',
      description: 'Biblical citation with version attribution',
      icon: 'cross',
      category: 'custom',
      command: () => {
        window.dispatchEvent(new CustomEvent('open-node-modal', { detail: { nodeType: 'bibleVerse' } }));
      },
    });

    this.register({
      id: 'evidenceImage',
      title: 'Evidence Image',
      description: 'Primary & volume cover plates with citation',
      icon: 'evidence',
      category: 'custom',
      command: () => {
        window.dispatchEvent(new CustomEvent('open-node-modal', { detail: { nodeType: 'evidenceImage' } }));
      },
    });

    this.register({
      id: 'callout',
      title: 'Callout Box',
      description: 'Semantic box (Answer, Warning, Info, Claim)',
      icon: 'callout',
      category: 'custom',
      command: () => {
        window.dispatchEvent(new CustomEvent('open-node-modal', { detail: { nodeType: 'callout' } }));
      },
    });

    this.register({
      id: 'footnote',
      title: 'Footnote Reference',
      description: 'Inline superscript citation with hover card',
      icon: 'footnote',
      category: 'custom',
      command: () => {
        window.dispatchEvent(new CustomEvent('open-node-modal', { detail: { nodeType: 'footnote' } }));
      },
    });
  }

  public register(item: SlashCommandItem): void {
    const existingIndex = this.items.findIndex((i) => i.id === item.id);
    if (existingIndex >= 0) {
      this.items[existingIndex] = item;
    } else {
      this.items.push(item);
    }
  }

  public getItems(query = ''): SlashCommandItem[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.items;
    return this.items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
    );
  }
}

export const SlashMenuRegistry = new SlashMenuRegistryClass();
export default SlashMenuRegistry;
