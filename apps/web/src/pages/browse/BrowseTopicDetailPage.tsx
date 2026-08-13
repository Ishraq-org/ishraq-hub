import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '../../components/icons';

export const BrowseTopicDetailPage: React.FC = () => {
  const { lang = 'en', slug } = useParams<{ lang: string; slug: string }>();

  // 1. Fetch Topics to resolve target topic by slug
  const { data: topicsData, isLoading: isTopicsLoading } = useQuery({
    queryKey: ['topics'],
    queryFn: async () => {
      const res = await fetch('/api/topics');
      if (!res.ok) throw new Error('Failed to load topics');
      return res.json();
    },
  });

  const flatTopics = topicsData?.flatTopics || [];
  const currentTopic = flatTopics.find(
    (t: any) => t.slug?.en === slug || t.slug?.am === slug
  );

  // 2. Fetch published articles for resolved topic
  const { data: articlesData, isLoading: isArticlesLoading } = useQuery({
    queryKey: ['topicArticles', currentTopic?._id, lang],
    queryFn: async () => {
      if (!currentTopic?._id) return { translations: [] };
      const res = await fetch(
        `/api/articles?topicId=${currentTopic._id}&status=published&language=${lang}&limit=30`
      );
      if (!res.ok) throw new Error('Failed to load articles for topic');
      return res.json();
    },
    enabled: Boolean(currentTopic?._id),
  });

  const langKey = lang === 'am' ? 'am' : 'en';
  const topicName = currentTopic
    ? currentTopic.name[langKey] || currentTopic.name.en
    : slug;
  const topicDesc = currentTopic?.description?.[langKey] || currentTopic?.description?.en;
  const articles = articlesData?.translations || [];

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-6 space-y-8 text-xs text-[var(--text-primary)]">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-[var(--text-muted)] text-[11px]">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <span>/</span>
        <Link to={`/${lang}/topics`} className="hover:underline">
          Topics
        </Link>
        <span>/</span>
        <span className="text-[var(--accent)] font-bold">{topicName}</span>
      </div>

      {/* Header */}
      <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] space-y-2 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] font-mono">
          Topic Category • /{lang}
        </span>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">{topicName}</h1>
        {topicDesc && <p className="text-xs text-[var(--text-muted)] max-w-2xl">{topicDesc}</p>}
      </div>

      {/* Articles Grid */}
      {isTopicsLoading || isArticlesLoading ? (
        <div className="p-12 text-center text-[var(--text-muted)] italic">Loading published articles...</div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((item: any) => (
            <Link
              key={item._id}
              to={`/${item.language}/articles/${item.slug}`}
              className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] space-y-3 shadow-sm hover:border-[var(--accent)] transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] font-mono">
                    [{item.language.toUpperCase()}]
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {item.title}
                </h2>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span className="font-semibold text-[var(--accent)]">Read Published Article →</span>
                <Icon name="book-open" size={14} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-[var(--text-muted)] space-y-3 border border-[var(--border)] rounded-xl bg-[var(--bg-secondary)]">
          <Icon name="book-open" size={32} className="mx-auto text-[var(--border)]" />
          <p className="font-bold text-sm text-[var(--text-primary)]">No published articles in this topic yet.</p>
          <p className="text-xs">Check back soon as contributors review and publish new scholarly articles.</p>
        </div>
      )}
    </div>
  );
};

export default BrowseTopicDetailPage;
