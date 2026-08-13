import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Icon } from '../../components/icons';
import { ImageUploadField } from '../../components/ImageUploadField';

export const NewArticlePage: React.FC = () => {
  const navigate = useNavigate();
  const [articleType, setArticleType] = useState<'term' | 'general'>('term');
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'am'>('en');
  const [category, setCategory] = useState('Islamic Apologetics');
  const [topicId, setTopicId] = useState('');
  const [tags, setTags] = useState('theology, research');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch topics list
  const { data: topicsData, isLoading: topicsLoading } = useQuery({
    queryKey: ['topics'],
    queryFn: async () => {
      const res = await fetch('/api/topics');
      if (!res.ok) return [];
      const json = await res.json();
      return json.topics || json;
    },
  });

  const createArticleMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create article');
      }
      return data;
    },
    onSuccess: (data) => {
      const articleId = data.article._id;
      const lang = data.translation.language;
      navigate(`/editor/${articleId}/${lang}`);
    },
    onError: (err: any) => {
      setErrorMessage(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Article title is required');
      return;
    }

    let selectedTopicId = topicId;
    if (!selectedTopicId && topicsData && topicsData.length > 0) {
      selectedTopicId = topicsData[0]._id;
    }

    if (!selectedTopicId) {
      setErrorMessage('A topic must be selected');
      return;
    }

    createArticleMutation.mutate({
      articleType,
      topicId: selectedTopicId,
      category,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      language,
      title,
      coverImage: coverImage || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-12 px-4 sm:px-6 lg:px-8 text-[var(--text-primary)]">
      <div className="max-w-2xl mx-auto space-y-8 bg-[var(--bg-secondary)] p-8 rounded-xl border border-[var(--border)] shadow-lg">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--accent)]">
            Create New Article
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Initialize an Article shell and first translation draft.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 text-xs rounded border border-[var(--danger)] bg-[var(--danger)]/10 text-[var(--danger)] flex items-center gap-2">
            <Icon name="close" size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Article Type */}
          <div>
            <label className="block font-semibold mb-2">Article Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setArticleType('term')}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  articleType === 'term'
                    ? 'border-[var(--accent)] bg-[var(--accent)]/10 font-bold'
                    : 'border-[var(--border)] bg-[var(--bg-primary)] hover:border-[var(--accent)]'
                }`}
              >
                <p className="font-semibold text-sm">Term Definition</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Scholarship glossary entry
                </p>
              </button>

              <button
                type="button"
                onClick={() => setArticleType('general')}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  articleType === 'general'
                    ? 'border-[var(--accent)] bg-[var(--accent)]/10 font-bold'
                    : 'border-[var(--border)] bg-[var(--bg-primary)] hover:border-[var(--accent)]'
                }`}
              >
                <p className="font-semibold text-sm">General Article</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  In-depth scholarly research essay
                </p>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-semibold mb-1">Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Understanding Islamic Apologetics in Modern Context"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          {/* Cover Image Upload (Prompt 13 §90-91) */}
          <div>
            <ImageUploadField
              label="Article Hero Cover Image (Optional)"
              folder="covers"
              value={coverImage}
              onChange={setCoverImage}
              placeholder="Upload cover image to Cloudinary (Max 10MB)"
            />
          </div>

          {/* Language & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'am')}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none"
              >
                <option value="en">English (en)</option>
                <option value="am">Amharic (am)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          {/* Topic Select */}
          <div>
            <label className="block font-semibold mb-1">Topic</label>
            {topicsLoading ? (
              <div className="p-2 text-xs text-[var(--text-muted)]">Loading topics...</div>
            ) : (
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none"
              >
                {topicsData && topicsData.length > 0 ? (
                  topicsData.map((topic: any) => (
                    <option key={topic._id} value={topic._id}>
                      {topic.title?.en || topic.name?.en || topic.slug?.en || topic.slug}
                    </option>
                  ))
                ) : (
                  <option value="">No topics available</option>
                )}
              </select>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block font-semibold mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-primary)] transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createArticleMutation.isPending}
              className="px-5 py-2 rounded-lg bg-[var(--accent)] text-[var(--bg-secondary)] hover:bg-[var(--accent-hover)] font-bold transition-colors disabled:opacity-50"
            >
              {createArticleMutation.isPending ? 'Creating...' : 'Create & Edit Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewArticlePage;
