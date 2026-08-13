import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { HoverPopover } from '../common/HoverPopover';
import { Icon } from '../icons';

interface ArticleLinkHoverProps {
  targetArticleId: string;
  href: string;
  children: React.ReactNode;
  language?: string;
}

export const ArticleLinkHover: React.FC<ArticleLinkHoverProps> = ({
  targetArticleId,
  href,
  children,
  language = 'en',
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch article preview data with 5-minute staleTime caching per Prompt 10 §50-52
  const { data: previewData, isLoading } = useQuery({
    queryKey: ['articlePreview', targetArticleId, language],
    queryFn: async () => {
      const res = await fetch(`/api/articles/${targetArticleId}/preview?language=${language}`);
      if (!res.ok) throw new Error('Preview unavailable');
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes staleTime per Prompt 10 §50
    enabled: Boolean(targetArticleId) && !isMobile,
  });

  const anchorElement = (
    <Link
      to={href}
      className="article-internal-link inline border-b border-dotted border-[var(--accent)] text-[var(--accent)] font-semibold hover:opacity-80 transition-opacity"
    >
      {children}
    </Link>
  );

  // Mobile viewport: Direct navigation on tap, zero hover popover state per Prompt 10 §60-66
  if (isMobile) {
    return anchorElement;
  }

  const popoverContent = (
    <div className="space-y-2 text-left">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-1 mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
        <span>Ishraq Article Peek</span>
        <span className="text-[var(--text-muted)] bg-[var(--bg-primary)] px-1.5 py-0.5 rounded border border-[var(--border)]">
          {previewData?.category || 'Apologetics'}
        </span>
      </div>

      {isLoading ? (
        <div className="p-3 text-center text-[var(--text-muted)] text-[11px] animate-pulse">
          Loading article peek...
        </div>
      ) : previewData ? (
        <>
          {previewData.coverImage?.url && (
            <img
              src={previewData.coverImage.url}
              alt={previewData.coverImage.alt || previewData.title}
              className="w-full h-24 object-cover rounded border border-[var(--border)]"
            />
          )}
          <h4 className="font-bold text-xs text-[var(--text-primary)] leading-tight">
            {previewData.title}
          </h4>
          {previewData.description && (
            <p className="text-[10px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
              {previewData.description}
            </p>
          )}
          <div className="pt-1 flex items-center justify-between text-[9px] font-semibold text-[var(--accent)]">
            <span>Click link text to read full article</span>
            <Icon name="external-link" size={10} />
          </div>
        </>
      ) : (
        <div className="text-[10px] text-[var(--text-muted)] p-2 text-center">
          Preview unavailable for this article.
        </div>
      )}
    </div>
  );

  return <HoverPopover trigger={anchorElement} content={popoverContent} />;
};

export default ArticleLinkHover;
