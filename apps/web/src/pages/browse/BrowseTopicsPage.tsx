import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '../../components/icons';

interface TopicItem {
  _id: string;
  name: { en: string; am: string };
  slug: { en: string; am: string };
  description?: { en: string; am: string } | null;
  children?: TopicItem[];
}

export const BrowseTopicsPage: React.FC = () => {
  const { lang = 'en' } = useParams<{ lang: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['topics'],
    queryFn: async () => {
      const res = await fetch('/api/topics');
      if (!res.ok) throw new Error('Failed to load topics');
      return res.json();
    },
  });

  const rootTopics: TopicItem[] = data?.topics || [];
  const langKey = lang === 'am' ? 'am' : 'en';

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-6 space-y-8 text-xs text-[var(--text-primary)]">
      {/* Header */}
      <div className="text-center space-y-3 border-b border-[var(--border)] pb-6">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] font-mono">
          Language Directory: /{lang}
        </span>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">
          {lang === 'am' ? 'የእውቀት እና የርዕሶች ማውጫ' : 'Apologetics Topics & Categories'}
        </h1>
        <p className="text-sm text-[var(--text-muted)] max-w-xl mx-auto">
          Explore structured research taxonomy across Quranic manuscript studies, Hadith authentication, and biblical criticism.
        </p>
      </div>

      {/* Topics Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-[var(--text-muted)] italic">Loading topics directory...</div>
      ) : rootTopics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rootTopics.map((topic) => {
            const name = topic.name[langKey] || topic.name.en;
            const slug = topic.slug[langKey] || topic.slug.en;
            const desc = topic.description?.[langKey] || topic.description?.en;

            return (
              <div
                key={topic._id}
                className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] space-y-4 shadow-sm hover:border-[var(--accent)] transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] font-mono">
                      Category
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">/{slug}</span>
                  </div>

                  <h2 className="text-xl font-bold text-[var(--text-primary)]">{name}</h2>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {desc || 'Exploration of scholarly research and refutations.'}
                  </p>

                  {/* Sub-Topics List */}
                  {topic.children && topic.children.length > 0 && (
                    <div className="pt-2 border-t border-[var(--border)] space-y-1">
                      <p className="text-[10px] font-semibold text-[var(--text-muted)]">Sub-Topics:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {topic.children.map((child) => (
                          <Link
                            key={child._id}
                            to={`/${lang}/topics/${child.slug[langKey] || child.slug.en}`}
                            className="px-2 py-0.5 rounded bg-[var(--bg-primary)] border border-[var(--border)] hover:border-[var(--accent)] text-[10px] font-medium"
                          >
                            {child.name[langKey] || child.name.en}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-end border-t border-[var(--border)]">
                  <Link
                    to={`/${lang}/topics/${slug}`}
                    className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
                  >
                    <span>View Articles in {name}</span>
                    <Icon name="chevron-right" size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center text-[var(--text-muted)] italic">No topics found in directory.</div>
      )}
    </div>
  );
};

export default BrowseTopicsPage;
