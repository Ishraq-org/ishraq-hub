import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { Icon } from '../icons';
import { ArticleLinkSearchModal } from './modals/ArticleLinkSearchModal';

interface EditorToolbarProps {
  editor: Editor | null;
  language?: string;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor, language = 'en' }) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  if (!editor) {
    return null;
  }

  const isLinked = editor.isActive('link');

  const handleSelectArticle = (item: { articleId: string; slug: string; language: string }) => {
    const href = `/${item.language}/articles/${item.slug}`;
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setArticleLink({
        targetArticleId: item.articleId,
        href,
      })
      .run();

    setIsSearchModalOpen(false);
  };

  const handleRemoveLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetArticleLink().run();
    setIsSearchModalOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[var(--bg-secondary)] border-b border-[var(--border)] text-xs text-[var(--text-primary)] sticky top-16 z-30 shadow-sm">
      {/* Bold */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('bold')
            ? 'bg-[var(--accent)] text-[var(--bg-secondary)] font-bold'
            : 'hover:bg-[var(--bg-primary)] text-[var(--text-primary)]'
        }`}
        title="Bold (Ctrl+B)"
      >
        <span className="font-bold px-0.5">B</span>
      </button>

      {/* Italic */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('italic')
            ? 'bg-[var(--accent)] text-[var(--bg-secondary)] italic font-bold'
            : 'hover:bg-[var(--bg-primary)] text-[var(--text-primary)]'
        }`}
        title="Italic (Ctrl+I)"
      >
        <span className="italic font-bold px-0.5">I</span>
      </button>

      <div className="w-px h-4 bg-[var(--border)] mx-1" />

      {/* Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
          editor.isActive('heading', { level: 1 })
            ? 'bg-[var(--accent)] text-[var(--bg-secondary)]'
            : 'hover:bg-[var(--bg-primary)] text-[var(--text-primary)]'
        }`}
      >
        H1
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
          editor.isActive('heading', { level: 2 })
            ? 'bg-[var(--accent)] text-[var(--bg-secondary)]'
            : 'hover:bg-[var(--bg-primary)] text-[var(--text-primary)]'
        }`}
      >
        H2
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
          editor.isActive('heading', { level: 3 })
            ? 'bg-[var(--accent)] text-[var(--bg-secondary)]'
            : 'hover:bg-[var(--bg-primary)] text-[var(--text-primary)]'
        }`}
      >
        H3
      </button>

      <div className="w-px h-4 bg-[var(--border)] mx-1" />

      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('bulletList')
            ? 'bg-[var(--accent)] text-[var(--bg-secondary)]'
            : 'hover:bg-[var(--bg-primary)] text-[var(--text-primary)]'
        }`}
        title="Bullet List"
      >
        <Icon name="list-bullet" size={16} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('orderedList')
            ? 'bg-[var(--accent)] text-[var(--bg-secondary)]'
            : 'hover:bg-[var(--bg-primary)] text-[var(--text-primary)]'
        }`}
        title="Numbered List"
      >
        <Icon name="list-ordered" size={16} />
      </button>

      {/* Blockquote */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('blockquote')
            ? 'bg-[var(--accent)] text-[var(--bg-secondary)]'
            : 'hover:bg-[var(--bg-primary)] text-[var(--text-primary)]'
        }`}
        title="Quote Block"
      >
        <Icon name="quote" size={16} />
      </button>

      {/* Table */}
      <button
        type="button"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        className="p-1.5 rounded hover:bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors"
        title="Insert Table (3x3)"
      >
        <Icon name="table" size={16} />
      </button>

      <div className="w-px h-4 bg-[var(--border)] mx-1" />

      {/* Wikipedia-Style Internal Article Link Search Button */}
      <button
        type="button"
        onClick={() => setIsSearchModalOpen(true)}
        className={`p-1.5 rounded transition-colors flex items-center gap-1 text-xs font-medium ${
          isLinked
            ? 'bg-[var(--accent)] text-[var(--bg-secondary)] font-bold'
            : 'hover:bg-[var(--bg-primary)] text-[var(--text-primary)]'
        }`}
        title="Link to Ishraq Article (Wikipedia-Style Search)"
      >
        <Icon name="link" size={14} />
        <span>Article Link</span>
      </button>

      {/* Article Link Search Modal */}
      <ArticleLinkSearchModal
        isOpen={isSearchModalOpen}
        language={language}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectArticle={handleSelectArticle}
        onRemoveLink={handleRemoveLink}
        isLinked={isLinked}
      />
    </div>
  );
};

export default EditorToolbar;
