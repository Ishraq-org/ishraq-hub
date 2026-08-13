import React, { useState, useEffect } from 'react';
import { Icon } from '../../icons';

interface SearchResultItem {
  articleId: string;
  translationId: string;
  title: string;
  category: string;
  slug: string;
  language: string;
}

interface ArticleLinkSearchModalProps {
  isOpen: boolean;
  language?: string;
  onClose: () => void;
  onSelectArticle: (item: SearchResultItem) => void;
  onRemoveLink?: () => void;
  isLinked?: boolean;
}

export const ArticleLinkSearchModal: React.FC<ArticleLinkSearchModalProps> = ({
  isOpen,
  language = 'en',
  onClose,
  onSelectArticle,
  onRemoveLink,
  isLinked = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setResults([]);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/articles/search?q=${encodeURIComponent(searchQuery)}&language=${language}`
        );
        if (res.ok) {
          const json = await res.json();
          setResults(json.results || []);
        }
      } catch (err) {
        console.error('Link search failed:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, language]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="max-w-md w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5 shadow-2xl space-y-4 text-xs text-[var(--text-primary)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2 font-bold text-sm text-[var(--accent)]">
            <Icon name="link" size={16} />
            <span>Link to Ishraq Article ({language.toUpperCase()})</span>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-[var(--bg-primary)]">
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            autoFocus
            placeholder="Type article title to search published hub..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none text-xs"
          />
          <div className="absolute left-3 top-2.5 text-[var(--text-muted)]">
            <Icon name="search" size={14} />
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-60 overflow-y-auto space-y-1 divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg bg-[var(--bg-primary)] p-1">
          {isLoading ? (
            <div className="p-4 text-center text-[var(--text-muted)] italic">
              Searching published articles...
            </div>
          ) : results.length > 0 ? (
            results.map((item) => (
              <button
                key={item.articleId}
                type="button"
                onClick={() => onSelectArticle(item)}
                className="w-full p-2.5 text-left rounded hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-[var(--text-primary)]">{item.title}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    Category: {item.category} • /{item.language}/articles/{item.slug}
                  </p>
                </div>
                <Icon name="external-link" size={14} className="text-[var(--accent)]" />
              </button>
            ))
          ) : searchQuery.trim() ? (
            <div className="p-4 text-center text-[var(--text-muted)] italic">
              No published articles found matching "{searchQuery}"
            </div>
          ) : (
            <div className="p-4 text-center text-[var(--text-muted)]">
              Start typing to search published articles...
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          {isLinked && onRemoveLink ? (
            <button
              type="button"
              onClick={onRemoveLink}
              className="text-[var(--danger)] hover:underline font-semibold text-[11px]"
            >
              Unlink Text
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 font-semibold rounded border border-[var(--border)] hover:bg-[var(--bg-primary)]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleLinkSearchModal;
