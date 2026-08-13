import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '../../components/icons';
import { TipTapRenderer, extractHeadingsFromContent } from '../../components/article-render/TipTapRenderer';
import { TableOfContents } from '../../components/article-render/TableOfContents';
import { AdSlot } from '../../components/ads/AdSlot';

function computeReadingTime(content: any): number {
  if (!content) return 1;
  let wordCount = 0;

  const traverse = (node: any) => {
    if (!node) return;
    if (node.type === 'text' && node.text) {
      const words = node.text.trim().split(/\s+/).filter(Boolean);
      wordCount += words.length;
    }
    if (Array.isArray(node.content)) {
      node.content.forEach(traverse);
    }
  };

  traverse(content);
  const minutes = Math.ceil(wordCount / 200);
  return minutes < 1 ? 1 : minutes;
}

export const ArticleReadingPage: React.FC = () => {
  const { language = 'en', slug = '' } = useParams<{ language: string; slug: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['publicArticle', language, slug],
    queryFn: async () => {
      const res = await fetch(`/api/articles/by-slug/${language}/${slug}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('ARTICLE_NOT_FOUND');
        throw new Error('Failed to load article');
      }
      return res.json();
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6 text-[var(--text-muted)] text-sm">
        <div className="flex items-center gap-3">
          <Icon name="search" size={20} className="animate-spin text-[var(--accent)]" />
          <span>Loading article...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-4 rounded-full bg-rose-950/30 border border-rose-800/50 text-rose-400">
          <Icon name="warning" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Article Not Found (404)</h1>
        <p className="text-xs text-[var(--text-muted)] max-w-md leading-relaxed">
          The requested article is either unpublished, invalid, or does not exist in this language.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-5 py-2 rounded-lg bg-[var(--accent)] text-[var(--bg-secondary)] font-bold text-xs hover:opacity-90 transition-opacity"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const { translation, article, author, translationsSummary, breadcrumb, relatedArticles } = data;
  const headings = extractHeadingsFromContent(translation.content);
  const readingTime = computeReadingTime(translation.content);

  const formattedDate = translation.publishedAt
    ? new Date(translation.publishedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recently Published';

  // Concrete Language Toggle (Prompt 11 Section 3)
  const isEn = language === 'en';
  const siblingLang = isEn ? 'am' : 'en';
  const siblingSummary = isEn ? translationsSummary.am : translationsSummary.en;
  const siblingLabel = isEn ? 'Amharic' : 'English';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24">
      {/* 1. Top Navbar / Header Bar */}
      <header className="border-b border-[var(--border)] bg-[var(--bg-secondary)] sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-sm text-[var(--accent)]">
            <Icon name="book-open" size={18} />
            <span>Ishraq Hub</span>
          </Link>

          <div className="flex items-center gap-3 text-xs">
            {/* Concrete Language Toggle Link / Disabled state */}
            {siblingSummary && siblingSummary.status === 'published' ? (
              <Link
                to={`/${siblingLang}/articles/${siblingSummary.slug}`}
                className="px-3 py-1 rounded-full border border-[var(--accent)] text-[var(--accent)] font-semibold hover:bg-[var(--accent)] hover:text-[var(--bg-secondary)] transition-all flex items-center gap-1.5"
              >
                <Icon name="globe" size={14} />
                <span>Switch to {siblingLabel}</span>
              </Link>
            ) : (
              <span
                className="px-3 py-1 rounded-full border border-[var(--border)] text-[var(--text-muted)] opacity-60 cursor-not-allowed text-[11px]"
                title={`${siblingLabel} version not yet published`}
              >
                {siblingLabel} not available
              </span>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Cover Image */}
      {article.coverImage?.url && (
        <div className="w-full h-64 sm:h-96 overflow-hidden border-b border-[var(--border)] bg-[var(--bg-secondary)] relative">
          <img
            src={article.coverImage.url}
            alt={article.coverImage.alt || translation.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent opacity-90" />
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        {/* 3. Breadcrumb Chain */}
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] overflow-x-auto pb-1">
            <Link to="/" className="hover:text-[var(--accent)]">Home</Link>
            {breadcrumb.map((b: any, idx: number) => (
              <React.Fragment key={idx}>
                <Icon name="chevron-right" size={12} />
                <span className={idx === breadcrumb.length - 1 ? 'font-semibold text-[var(--text-primary)]' : ''}>
                  {b.name}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* 4. Article Title & Meta */}
        <header className="space-y-4 border-b border-[var(--border)] pb-6">
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] font-bold text-[10px] uppercase tracking-wider">
            {article.category || 'Apologetics'}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] leading-tight">
            {translation.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] font-medium">
            <span className="font-bold text-[var(--text-primary)]">{author.name}</span>
            <span>•</span>
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Icon name="clock" size={14} />
              <span>{readingTime} min read</span>
            </span>
          </div>
        </header>

        {/* 5. Article Body Renderer */}
        <article className="prose max-w-none text-lg leading-relaxed text-[var(--text-primary)]">
          <TipTapRenderer content={translation.content} language={language} />
        </article>

        {/* 6. Related Concepts (Tags) */}
        {article.tags && article.tags.length > 0 && (
          <section className="pt-8 border-t border-[var(--border)] space-y-3">
            <h3 className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
              Related Concepts & Themes
            </h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-muted)] font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 7. Next Related Shubha Card */}
        {article.nextRelatedShubhaPreview && (
          <section className="pt-8 space-y-3">
            <h3 className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
              Continue Reading — Next Related Objection
            </h3>
            <Link
              to={`/${article.nextRelatedShubhaPreview.language}/articles/${article.nextRelatedShubhaPreview.slug}`}
              className="block p-5 rounded-xl border border-[var(--accent)]/50 bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-all shadow-md group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">
                    {article.nextRelatedShubhaPreview.category}
                  </span>
                  <h4 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mt-1">
                    {article.nextRelatedShubhaPreview.title}
                  </h4>
                  {article.nextRelatedShubhaPreview.description && (
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1">
                      {article.nextRelatedShubhaPreview.description}
                    </p>
                  )}
                </div>
                <Icon name="chevron-right" size={24} className="text-[var(--accent)] ml-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </section>
        )}

        {/* 8. Related Articles Grid */}
        {relatedArticles && relatedArticles.length > 0 && (
          <section className="pt-10 border-t border-[var(--border)] space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Icon name="book-open" size={16} className="text-[var(--accent)]" />
              <span>Related Articles in {article.category}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedArticles.map((rel: any) => (
                <Link
                  key={rel.id}
                  to={`/${rel.language}/articles/${rel.slug}`}
                  className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-all flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-[10px] text-[var(--accent)] font-bold uppercase">
                      {rel.category}
                    </span>
                    <h4 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mt-1">
                      {rel.title}
                    </h4>
                  </div>
                  <div className="mt-4 flex items-center justify-end text-[11px] text-[var(--accent)] font-semibold">
                    <span>Read Article</span>
                    <Icon name="chevron-right" size={14} className="ml-1" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 9. Article Footer Ad Placement (Prompt 18 §43-56 — Consent-gated, never inside article body) */}
        <AdSlot slot="article-footer" />
      </main>

      {/* 9. Table of Contents Bottom Sheet Button */}
      <TableOfContents headings={headings} />
    </div>
  );
};

export default ArticleReadingPage;
