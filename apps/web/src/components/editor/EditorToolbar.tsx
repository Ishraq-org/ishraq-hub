import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { Icon } from '../icons';

interface EditorToolbarProps {
  editor: Editor | null;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  const [linkInputVisible, setLinkInputVisible] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  if (!editor) {
    return null;
  }

  /* 
   * NOTE (Master Prompt §1.2 & §5.4):
   * This basic URL link handler is explicitly a temporary placeholder for the editor foundation.
   * It will be replaced by the full Wikipedia-style internal article link mark (targetArticleId,
   * hover preview via GET /api/articles/:articleId/preview, TanStack Query caching) in a separate follow-on prompt.
   */
  const handleSetLink = () => {
    if (!linkUrl) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setLinkInputVisible(false);
    setLinkUrl('');
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

      {/* Placeholder Basic Link */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setLinkInputVisible(!linkInputVisible)}
          className={`p-1.5 rounded transition-colors flex items-center gap-1 text-xs font-medium ${
            editor.isActive('link')
              ? 'bg-[var(--accent)] text-[var(--bg-secondary)]'
              : 'hover:bg-[var(--bg-primary)] text-[var(--text-primary)]'
          }`}
          title="Add URL Link (Placeholder)"
        >
          <Icon name="link" size={14} />
          <span>Link</span>
        </button>

        {linkInputVisible && (
          <div className="absolute left-0 mt-2 p-2 w-64 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-xl flex gap-2 z-50">
            <input
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="flex-1 px-2 py-1 text-xs rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSetLink}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-[var(--accent)] text-[var(--bg-secondary)]"
            >
              Set
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorToolbar;
