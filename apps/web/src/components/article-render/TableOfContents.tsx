import React, { useState } from 'react';
import { Icon } from '../icons';

export interface TOCHeadingItem {
  id: string;
  level: number;
  text: string;
}

interface TableOfContentsProps {
  headings: TOCHeadingItem[];
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ headings }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!headings || headings.length === 0) return null;

  const handleScrollToHeading = (id: string) => {
    setIsOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* Sticky Jump to Section Button per Master Prompt §11 & Prompt 11 §118-121 */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--accent)] text-[var(--bg-secondary)] font-bold text-xs shadow-xl hover:opacity-90 transition-all border border-amber-400/30"
        >
          <Icon name="list-bullet" size={16} />
          <span>Jump to Section</span>
          <span className="bg-black/20 text-white rounded-full px-2 py-0.5 text-[10px]">
            {headings.length}
          </span>
        </button>
      </div>

      {/* Bottom Sheet Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full sm:max-w-md bg-[var(--bg-secondary)] border border-[var(--border)] rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl space-y-4 max-h-[80vh] flex flex-col text-xs text-[var(--text-primary)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-[var(--accent)]">
                <Icon name="list-bullet" size={18} />
                <span>Table of Contents</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-[var(--bg-primary)]"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {/* Heading Jump List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 divide-y divide-[var(--border)]/50">
              {headings.map((h) => {
                const indentClass =
                  h.level === 2
                    ? 'pl-3 font-semibold'
                    : h.level === 3
                    ? 'pl-6 text-[var(--text-muted)]'
                    : h.level === 4
                    ? 'pl-9 text-[var(--text-muted)] italic'
                    : 'font-bold text-[var(--accent)]';

                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => handleScrollToHeading(h.id)}
                    className={`w-full py-2 text-left rounded hover:bg-[var(--bg-primary)] transition-colors flex items-center justify-between text-xs ${indentClass}`}
                  >
                    <span className="line-clamp-1">{h.text}</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono ml-2">H{h.level}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TableOfContents;
